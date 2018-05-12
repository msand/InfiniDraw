import React, { Component, PureComponent } from 'react';
import {
  View,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { SlidersColorPicker } from './picker';
import BasicSlider from './slider';
import tinycolor from 'tinycolor2';

import ZoomableSvg from 'zoomable-svg';

import SvgComponentFactory from './svg';

const defaultColor = tinycolor('#247ba0');

const styles = {
  container: {
    backgroundColor: '#ecf0f1',
  },
  absfill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  buttons: {
    position: 'absolute',
    alignItems: 'flex-end',
    bottom: 10,
    right: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    pointerEvents: 'none',
  },
  scrollContent: {
    pointerEvents: 'none',
  },
  headerText: {
    marginTop: 24,
    fontSize: 34,
    lineHeight: 41,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-bold',
      },
      ios: {
        fontWeight: '700',
        letterSpacing: 0.41,
      },
    }),
  },
  sectionText: {
    marginTop: 32,
    color: '#222',
    fontSize: 22,
    lineHeight: 28,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontWeight: '600',
        letterSpacing: 0.75,
      },
    }),
  },
  componentText: {
    marginTop: 16,
    color: '#222',
    fontSize: 16,
    lineHeight: 21,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontWeight: '600',
        letterSpacing: -0.408,
      },
    }),
  },
  button: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.25,
  },
  gradient: {
    alignSelf: 'stretch',
    marginLeft: 12,
    marginTop: 12,
    marginBottom: 16,
    height: 4,
  },
  sliderRow: {
    alignSelf: 'stretch',
    marginLeft: 12,
    marginTop: 12,
  },
  colorString: {
    fontSize: 14,
    lineHeight: 21,
    ...Platform.select({
      android: {
        fontFamily: 'monospace',
      },
      ios: {
        fontFamily: 'Courier New',
        fontWeight: '600',
        letterSpacing: 0.75,
      },
    }),
  },
};

const ALL_PATHS_QUERY = gql`
  query AllPathsQuery {
    allPaths {
      id
      createdAt
      points
      stroke
      strokeWidth
    }
  }
`;

const CREATE_PATH_MUTATION = gql`
  mutation CreatePathMutation(
    $points: [Float!]!
    $stroke: String!
    $strokeWidth: Float!
  ) {
    createPath(points: $points, stroke: $stroke, strokeWidth: $strokeWidth) {
      id
      createdAt
      points
      stroke
      strokeWidth
    }
  }
`;

export default (Svg, G, Path, Rect) => {
  const { Background, Foreground } = SvgComponentFactory(Svg, G, Path, Rect);

  class SvgRoot extends PureComponent {
    constructor() {
      super();
      const noop = () => {};
      const yes = () => true;
      const shouldRespond = () => {
        return this.props.drawing;
      };
      this._panResponder = PanResponder.create({
        onPanResponderGrant: noop,
        onPanResponderTerminate: noop,
        onShouldBlockNativeResponder: yes,
        onMoveShouldSetPanResponder: shouldRespond,
        onStartShouldSetPanResponder: shouldRespond,
        onPanResponderTerminationRequest: shouldRespond,
        onMoveShouldSetPanResponderCapture: shouldRespond,
        onStartShouldSetPanResponderCapture: shouldRespond,
        onPanResponderMove: ({ nativeEvent }) => {
          const { touches } = nativeEvent;
          const { length } = touches;
          if (length === 1) {
            const [{ pageX, pageY }] = touches;
            this.processTouch(pageX, pageY);
          }
        },
        onPanResponderRelease: async () => {
          const { currentPath } = this.state;
          if (currentPath) {
            this.setState({
              currentPath: null,
            });
            const { points, stroke, strokeWidth } = currentPath;
            await this.props.createPathMutation({
              variables: {
                points,
                stroke,
                strokeWidth,
              },
              optimisticResponse: {
                __typename: 'Mutation',
                createPath: {
                  __typename: 'Path',
                  id: Math.random(),
                  createdAt: new Date(),
                  points,
                  stroke,
                  strokeWidth,
                },
              },
              update: (proxy, { data: { createPath } }) => {
                const data = proxy.readQuery({ query: ALL_PATHS_QUERY });
                data.allPaths.push(createPath);
                proxy.writeQuery({ query: ALL_PATHS_QUERY, data });
              },
            });
          }
        },
      });
    }

    state = {
      currentPath: null,
    };

    componentDidMount() {
      this._subscribeToNewPaths();
    }

    processTouch = (sx, sy) => {
      const {
        transform: { translateX, translateY, scaleX, scaleY },
        hex = '#000000',
        strokeWidth = 1,
      } = this.props;
      const x = (sx - translateX) / scaleX;
      const y = (sy - translateY) / scaleY;
      this.setState(
        ({ currentPath }) =>
          currentPath
            ? {
                currentPath: {
                  ...currentPath,
                  points: [...currentPath.points, x, y],
                },
              }
            : {
                currentPath: {
                  points: [x, y],
                  stroke: hex,
                  strokeWidth,
                },
              },
      );
    };

    _subscribeToNewPaths = () => {
      this.props.allPathsQuery.subscribeToMore({
        document: gql`
          subscription {
            Path(filter: { mutation_in: [CREATED] }) {
              node {
                id
                createdAt
                points
                stroke
                strokeWidth
              }
            }
          }
        `,
        updateQuery: (previous, { subscriptionData: { data: { Path } } }) => {
          if (!Path) {
            return;
          }
          const newPathLinks = [...previous.allPaths, Path.node];
          return {
            ...previous,
            allPaths: newPathLinks,
          };
        },
      });
    };

    render() {
      const { currentPath } = this.state;
      const {
        transform: { translateX, translateY, scaleX, scaleY },
        allPathsQuery: { allPaths = [] },
      } = this.props;
      const transform = `translate(${translateX},${translateY})scale(${scaleX},${scaleY})`;
      return (
        <View {...this._panResponder.panHandlers} style={styles.absfill}>
          <Background transform={transform} paths={allPaths} />
          <Foreground transform={transform} currentPath={currentPath} />
        </View>
      );
    }
  }

  const WithPathQuery = compose(
    graphql(ALL_PATHS_QUERY, { name: 'allPathsQuery' }),
    graphql(CREATE_PATH_MUTATION, { name: 'createPathMutation' }),
  )(SvgRoot);

  const { width, height } = Dimensions.get('window');

  return class App extends PureComponent {
    constructor(props) {
      super(props);
      this.zoomable = React.createRef();
    }

    state = {
      width,
      height,
      drawing: false,
      modalVisible: false,
      recents: ['#247ba0', '#70c1b3', '#b2dbbf', '#f3ffbd', '#ff1654'],
      hsl: defaultColor.toHslString(),
      hex: defaultColor.toHexString(),
      color: defaultColor.toHsl(),
      strokeWidth: 1,
    };

    toggleDrawing = () => {
      this.setState(({ drawing }) => ({
        drawing: !drawing,
      }));
    };

    togglePicker = () => {
      this.setState(({ modalVisible }) => ({
        modalVisible: !modalVisible,
      }));
    };

    onStrokeWidth = w => {
      this.setState({ strokeWidth: w });
    };

    reset = () => {
      this.zoomable.current.reset();
    };

    updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      this.setState({ width, height });
    };

    componentDidMount() {
      this.updateDimensions();
      Dimensions.addEventListener('change', this.updateDimensions);
    }

    componentWillUnmount() {
      Dimensions.removeEventListener('change', this.updateDimensions);
    }

    render() {
      const {
        drawing,
        width,
        height,
        color,
        hsl,
        hex,
        strokeWidth,
      } = this.state;
      const tiny = tinycolor(color);
      const overlayTextColor = tiny.isDark() ? '#FAFAFA' : '#222';
      return (
        <View style={[styles.container, styles.absfill]}>
          <ZoomableSvg
            lock={drawing}
            width={width}
            height={height}
            ref={this.zoomable}
            style={styles.absfill}
            childProps={this.state}
            doubleTapThreshold={300}
            meetOrSlice="meet"
            svgRoot={WithPathQuery}
            vbWidth={100}
            vbHeight={100}
            initialTop={0}
            initialLeft={0}
            initialZoom={1}
            align="mid"
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={this.toggleDrawing}
              style={styles.button}
            >
              <Text>{drawing ? 'Move' : 'Draw'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.reset} style={styles.button}>
              <Text>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.togglePicker}
              style={[
                styles.button,
                {
                  backgroundColor: hsl,
                },
              ]}
            >
              <Text style={[styles.colorString, { color: overlayTextColor }]}>
                {hex}
              </Text>
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Text style={[styles.colorString]}>
                {strokeWidth.toFixed(2)}px
              </Text>
              <BasicSlider
                style={{
                  width: '100px',
                  marginLeft: '6px',
                }}
                step={0.01}
                minimumValue={0.1}
                maximumValue={10}
                value={strokeWidth}
                thumbTintColor={hsl}
                onValueChange={this.onStrokeWidth}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            style={styles.content}
          >
            <SlidersColorPicker
              visible={this.state.modalVisible}
              color={this.state.color}
              returnMode={'hex'}
              onCancel={() => this.setState({ modalVisible: false })}
              onOk={colorHex => {
                const tiny = tinycolor(colorHex);
                this.setState({
                  modalVisible: false,
                  color: tiny.toHsl(),
                  hsl: tiny.toHslString(),
                  hex: tiny.toHexString(),
                });
                this.setState({
                  recents: [
                    colorHex,
                    ...this.state.recents
                      .filter(c => c !== colorHex)
                      .slice(0, 4),
                  ],
                });
              }}
              swatches={this.state.recents}
              swatchesLabel="RECENTS"
              okLabel="Done"
              cancelLabel="Cancel"
            />
          </ScrollView>
        </View>
      );
    }
  };
};
