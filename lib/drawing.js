import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Platform,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import gql from 'graphql-tag';
import tinycolor from 'tinycolor2';
import ZoomableSvg from 'zoomable-svg';
import { graphql, compose } from 'react-apollo';

import SlidersColorPicker from './picker';
import SvgComponentFactory from './svg';
import BasicSlider from './slider';

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
  content: {
    flex: 1,
  },
  button: {
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#f6f8f8',
    borderRadius: 3,
  },
  shadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  drawingToggle: {
    minWidth: 85,
    marginHorizontal: 10.5,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brushIcon: {
    alignSelf: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  colorString: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    ...Platform.select({
      web: {
        userSelect: 'none',
        fontFamily: 'monospace',
      },
      android: {
        fontFamily: 'monospace',
      },
      ios: {
        fontFamily: 'Courier New',
        fontWeight: '600',
      },
    }),
  },
  widthSliderContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  widthSlider: {
    width: 124.5,
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

export default (Svg, G, Path, Rect, RadialGradient, Defs, Stop) => {
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
        onPanResponderMove: e => {
          const { nativeEvent } = e;
          const { touches } = nativeEvent;
          const { length } = touches;
          if (length === 1) {
            const [{ pageX, pageY }] = touches;
            this.processTouch(pageX, pageY);
          }
          e.preventDefault();
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

  const { width, height } = Dimensions.get('window');

  const defaultColor = '#247ba0';
  const defaultTiny = tinycolor(defaultColor);

  function BrushIcon({ bg, fill, opacity }) {
    return (
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        width="45"
        height="45"
        viewBox="0 0 768 768"
        style={[
          styles.brushIcon,
          {
            opacity,
          },
        ]}
      >
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={bg} stopOpacity="1" />
            <Stop offset="80%" stopColor={bg} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={bg} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="768" height="768" fill="url(#grad)" />
        <Path
          fill={fill}
          transform="translate(128, 128)"
          d="M242.544 352.215L464.363 14.398 207.615 325.049zM214.395 412.631l16.2-49.275-30.812-24.546-47.083 24.668zM195.983 422.748s8.397 105.595-148.337 65.945c0 0 26.419-.604 26.266-29.563 0 0 14.5-97.403 76.462-75.981l45.609 39.598z"
        />
      </Svg>
    );
  }

  return compose(
    graphql(ALL_PATHS_QUERY, { name: 'allPathsQuery' }),
    graphql(CREATE_PATH_MUTATION, { name: 'createPathMutation' }),
  )(
    class App extends PureComponent {
      state = {
        width,
        height,
        drawing: false,
        modalVisible: false,
        recents: ['#247ba0', '#70c1b3', '#b2dbbf', '#f3ffbd', '#ff1654'],
        isDark: defaultTiny.isDark(),
        color: defaultTiny.toHsl(),
        hex: defaultColor,
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

      onCancelColorPicker = () => {
        this.setState({ modalVisible: false });
      };

      onOkColorPicker = hex => {
        const tiny = tinycolor(hex);
        this.setState({
          modalVisible: false,
          isDark: tiny.isDark(),
          color: tiny.toHsl(),
          hex,
          recents: [
            hex,
            ...this.state.recents.filter(c => c !== hex).slice(0, 4),
          ],
        });
      };

      updateDimensions = () => {
        const { width, height } = Dimensions.get('window');
        this.setState({ width, height });
      };

      subscribeToNewPaths = () => {
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

      componentDidMount() {
        this.updateDimensions();
        this.subscribeToNewPaths();
        Dimensions.addEventListener('change', this.updateDimensions);
      }

      componentWillUnmount() {
        Dimensions.removeEventListener('change', this.updateDimensions);
      }

      zoomable = React.createRef();

      reset = () => {
        this.zoomable.current.reset();
      };

      render() {
        const {
          drawing,
          width,
          height,
          isDark,
          color,
          hex,
          recents,
          strokeWidth,
          modalVisible,
        } = this.state;
        const contrastColor = isDark ? '#FAFAFA' : '#222222';
        return (
          <View style={[styles.container, styles.absfill]}>
            <ZoomableSvg
              lock={drawing}
              width={width}
              height={height}
              ref={this.zoomable}
              style={styles.absfill}
              childProps={{ ...this.state, ...this.props }}
              doubleTapThreshold={300}
              svgRoot={SvgRoot}
              meetOrSlice="meet"
              vbWidth={100}
              vbHeight={100}
              initialTop={0}
              initialLeft={0}
              initialZoom={1}
              align="mid"
            />

            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={this.reset}
                style={[styles.button, styles.shadow]}
              >
                <Text>Reset</Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.iconContainer, styles.center]}
                  onPress={this.toggleDrawing}
                >
                  {BrushIcon({
                    bg: drawing ? hex : '#fff',
                    fill: drawing ? contrastColor : '#000000',
                    opacity: drawing ? 1 : 0.5,
                  })}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.togglePicker}
                  style={[
                    styles.button,
                    styles.shadow,
                    styles.row,
                    {
                      backgroundColor: hex,
                    },
                  ]}
                >
                  <Text style={[styles.colorString, { color: contrastColor }]}>
                    {`${strokeWidth.toFixed(2)}${hex}`}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.widthSliderContainer}>
                <TouchableOpacity
                  onPress={this.toggleDrawing}
                  style={[
                    styles.button,
                    styles.shadow,
                    styles.drawingToggle,
                    {
                      backgroundColor: drawing ? hex : '#f6f8f8',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: drawing ? contrastColor : 'black',
                    }}
                  >
                    {drawing ? 'Drawing' : 'Moving'}
                  </Text>
                </TouchableOpacity>
                <BasicSlider
                  step={0.01}
                  minimumValue={0.01}
                  maximumValue={9.99}
                  value={strokeWidth}
                  thumbTintColor={hex}
                  style={styles.widthSlider}
                  thumbContrastColor={contrastColor}
                  onValueChange={this.onStrokeWidth}
                />
              </View>
            </View>

            <View style={styles.content} pointerEvents="none">
              <SlidersColorPicker
                onCancel={this.onCancelColorPicker}
                onOk={this.onOkColorPicker}
                swatchesLabel="RECENTS"
                visible={modalVisible}
                returnMode={'hex'}
                swatches={recents}
                okLabel="Done"
                color={color}
              />
            </View>
          </View>
        );
      }
    },
  );
};
