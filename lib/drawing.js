import React, { Component, PureComponent } from 'react';
import {
  View,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text,
} from 'react-native';

import ZoomableSvg from 'zoomable-svg';

import SvgComponentFactory from './svg';

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
    bottom: 10,
    right: 10,
  },
};

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
        onPanResponderRelease: () => {
          if (this.state.currentPath) {
            this.setState(({ paths, currentPath }) => ({
              paths: [...paths, currentPath],
              currentPath: null,
            }));
          }
        },
      });
    }

    state = {
      paths: [],
      currentPath: null,
    };

    processTouch = (sx, sy) => {
      const {
        transform: { translateX, translateY, scaleX, scaleY },
      } = this.props;
      const x = (sx - translateX) / scaleX;
      const y = (sy - translateY) / scaleY;
      this.setState(
        ({ currentPath }) =>
          currentPath
            ? { currentPath: [...currentPath, [x, y]] }
            : { currentPath: [[x, y]] },
      );
    };

    render() {
      const { paths, currentPath } = this.state;
      const {
        transform: { translateX, translateY, scaleX, scaleY },
      } = this.props;
      const transform = `translate(${translateX},${translateY})scale(${scaleX},${scaleY})`;
      return (
        <View {...this._panResponder.panHandlers} style={styles.absfill}>
          <Background transform={transform} paths={paths} />
          <Foreground transform={transform} currentPath={currentPath} />
        </View>
      );
    }
  }

  const { width, height } = Dimensions.get('window');

  return class App extends PureComponent {
    constructor(props) {
      super(props);
      this.zoomable = React.createRef();
    }

    state = {
      drawing: false,
      height,
      width,
    };

    toggleDrawing = () => {
      this.setState(({ drawing }) => ({
        drawing: !drawing,
      }));
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
      const { drawing, width, height } = this.state;
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
            svgRoot={SvgRoot}
            vbWidth={100}
            vbHeight={100}
            initialTop={0}
            initialLeft={0}
            initialZoom={1}
            align="mid"
          />
          <View style={styles.buttons}>
            <TouchableOpacity onPress={this.reset}>
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.toggleDrawing}>
              <Text>{drawing ? 'Move' : 'Draw'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
};
