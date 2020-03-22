import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Easing,
  Platform,
  Animated,
  StyleSheet,
  PanResponder,
} from 'react-native';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

const defaultStyles = {
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_SIZE,
    borderRadius: TRACK_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: 'absolute',
    backgroundColor: 'green',
    opacity: 0.5,
  },
};

const styles = {
  container: {
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: 32,
  },
  thumb: {
    width: 32,
    height: 32,
    shadowRadius: 4,
    borderRadius: 16,
    shadowOpacity: 0.2,
    shadowColor: '#f6f8f8',
    borderColor: '#f6f8f880',
    justifyContent: 'center',
    marginLeft: StyleSheet.hairlineWidth,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: {width: 0, height: 2},
  },
  slider: Platform.OS === 'web' ? {cursor: 'ew-resize'} : {},
};

function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Rect.prototype.containsPoint = function containsPoint(x, y) {
  return (
    x >= this.x &&
    y >= this.y &&
    x <= this.x + this.width &&
    y <= this.y + this.height
  );
};

const DEFAULT_ANIMATION_CONFIGS = {
  spring: {
    friction: 7,
    tension: 100,
  },
  timing: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
    delay: 0,
  },
};

export class Slider extends PureComponent {
  static propTypes = {
    /**
     * Initial value of the slider. The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    value: PropTypes.number,

    /**
     * If true the user won't be able to move the slider.
     * Default value is false.
     */
    disabled: PropTypes.bool,

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue: PropTypes.number,

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue: PropTypes.number,

    /**
     * Step value of the slider. The value should be between 0 and
     * (maximumValue - minimumValue). Default value is 0.
     */
    step: PropTypes.number,

    /**
     * The color used for the track to the left of the button. Overrides the
     * default blue gradient image.
     */
    minimumTrackTintColor: PropTypes.string,

    /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     */
    maximumTrackTintColor: PropTypes.string,

    /**
     * The color used for the thumb.
     */
    thumbTintColor: PropTypes.string,

    /**
     * The size of the touch area that allows moving the thumb.
     * The touch area has the same center has the visible thumb.
     * This allows to have a visually small thumb while still allowing the user
     * to move it easily.
     * The default is {width: 40, height: 40}.
     */
    thumbTouchSize: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange: PropTypes.func,

    /**
     * Callback called when the user starts changing the value (e.g. when
     * the slider is pressed).
     */
    onSlidingStart: PropTypes.func,

    /**
     * Callback called when the user finishes changing the value (e.g. when
     * the slider is released).
     */
    onSlidingComplete: PropTypes.func,

    /**
     * The style applied to the slider container.
     */
    style: PropTypes.any,

    /**
     * The style applied to the track.
     */
    trackStyle: PropTypes.any,

    /**
     * The style applied to the thumb.
     */
    thumbStyle: PropTypes.any,

    /**
     * Sets an image for the thumb.
     */
    thumbImage: PropTypes.any,

    /**
     * Set this to true to visually see the thumb touch rect in green.
     */
    debugTouchArea: PropTypes.bool,

    /**
     * Set to true to animate values with default 'timing' animation type
     */
    animateTransitions: PropTypes.bool,

    /**
     * Custom Animation type. 'spring' or 'timing'.
     */
    animationType: PropTypes.oneOf(['spring', 'timing']),

    /**
     * Used to configure the animation parameters.  These are the same parameters in the Animated library.
     */
    animationConfig: PropTypes.object,
  };

  static defaultProps = {
    value: 0,
    minimumValue: 0,
    maximumValue: 1,
    step: 0,
    minimumTrackTintColor: '#3f3f3f',
    maximumTrackTintColor: '#b3b3b3',
    thumbTintColor: '#343434',
    thumbTouchSize: {width: 40, height: 40},
    debugTouchArea: false,
    animationType: 'timing',
  };

  static _handleMoveShouldSetPanResponder() {
    // Should we become active when the user moves a touch over the thumb?
    return false;
  }

  static _handlePanResponderRequestEnd() {
    // Should we allow another component to take over this pan?
    return false;
  }

  constructor(props) {
    super(props);
    const {value} = props;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: Slider._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: Slider._handlePanResponderRequestEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
    this.state = {
      containerSize: {width: 0, height: 0},
      thumbSize: {width: 0, height: 0},
      allMeasured: false,
      value: new Animated.Value(value),
    };
  }

  componentDidUpdate(prevProps) {
    const {value, animateTransitions} = this.props;

    if (prevProps.value !== value) {
      if (animateTransitions) {
        this._setCurrentValueAnimated(value);
      } else {
        this._setCurrentValue(value);
      }
    }
  }

  _handleStartShouldSetPanResponder = () => true;

  _handlePanResponderGrant = (/* e, gestureState */) => {
    this._previousLeft = this._getThumbLeft(this._getCurrentValue());
    this._fireChangeEvent('onSlidingStart');
  };

  _handlePanResponderMove = (e, gestureState) => {
    const {disabled} = this.props;
    if (disabled) {
      return;
    }

    this._setCurrentValue(this._getValue(gestureState));
    this._fireChangeEvent('onValueChange');
  };

  _handlePanResponderEnd = (e, gestureState) => {
    const {disabled, thumbTouchSize} = this.props;
    if (disabled) {
      return;
    }

    if (gestureState.dx === 0) {
      this._setCurrentValue(
        this._getValue({
          dx:
            e.nativeEvent.locationX -
            this._previousLeft -
            thumbTouchSize.width / 2,
        }),
      );
      this._fireChangeEvent('onValueChange');
    } else {
      this._setCurrentValue(this._getValue(gestureState));
    }
    this._fireChangeEvent('onSlidingComplete');
  };

  _measureContainer = (x) => {
    this._handleMeasure('containerSize', x);
  };

  _measureThumb = (x) => {
    this._handleMeasure('thumbSize', x);
  };

  _handleMeasure = (name, x) => {
    const {width, height} = x.nativeEvent.layout;
    const size = {width, height};

    const storeName = `_${name}`;
    const currentSize = this[storeName];
    if (
      currentSize &&
      width === currentSize.width &&
      height === currentSize.height
    ) {
      return;
    }
    this[storeName] = size;

    if (this._containerSize && this._thumbSize) {
      this.setState({
        containerSize: this._containerSize,
        thumbSize: this._thumbSize,
        allMeasured: true,
      });
    }
  };

  _getRatio = (value) => {
    const {minimumValue, maximumValue} = this.props;
    return (value - minimumValue) / (maximumValue - minimumValue);
  };

  _getThumbLeft = (value) => {
    const {containerSize, thumbSize} = this.state;
    const ratio = this._getRatio(value);
    return ratio * (containerSize.width - thumbSize.width);
  };

  _getValue = (gestureState) => {
    const {containerSize, thumbSize} = this.state;
    const {step, minimumValue, maximumValue} = this.props;
    const length = containerSize.width - thumbSize.width;
    const thumbLeft = this._previousLeft + gestureState.dx;

    const ratio = thumbLeft / length;

    if (step) {
      return Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          minimumValue +
            Math.round((ratio * (maximumValue - minimumValue)) / step) * step,
        ),
      );
    }
    return Math.max(
      minimumValue,
      Math.min(
        maximumValue,
        ratio * (maximumValue - minimumValue) + minimumValue,
      ),
    );
  };

  _getCurrentValue = () => {
    const {value} = this.state;
    return value.__getValue();
  };

  _setCurrentValue = (toValue) => {
    const {value} = this.state;
    value.setValue(toValue);
  };

  _setCurrentValueAnimated = (toValue) => {
    const {animationType, animationConfig} = this.props;
    const {value} = this.state;
    const newConfig = {
      ...DEFAULT_ANIMATION_CONFIGS[animationType],
      ...animationConfig,
      toValue,
    };

    Animated[animationType](value, newConfig).start();
  };

  _fireChangeEvent = (event) => {
    const {props} = this;
    if (props[event]) {
      props[event](this._getCurrentValue());
    }
  };

  _getTouchOverflowSize = () => {
    const {state, props} = this;

    const size = {};
    if (state.allMeasured === true) {
      size.width = Math.max(
        0,
        props.thumbTouchSize.width - state.thumbSize.width,
      );
      size.height = Math.max(
        0,
        props.thumbTouchSize.height - state.containerSize.height,
      );
    }

    return size;
  };

  _getTouchOverflowStyle = () => {
    const {debugTouchArea} = this.props;
    const {width, height} = this._getTouchOverflowSize();

    const touchOverflowStyle = {};
    if (width !== undefined && height !== undefined) {
      const verticalMargin = -height / 2;
      touchOverflowStyle.marginTop = verticalMargin;
      touchOverflowStyle.marginBottom = verticalMargin;

      const horizontalMargin = -width / 2;
      touchOverflowStyle.marginLeft = horizontalMargin;
      touchOverflowStyle.marginRight = horizontalMargin;
    }

    if (debugTouchArea === true) {
      touchOverflowStyle.backgroundColor = 'orange';
      touchOverflowStyle.opacity = 0.5;
    }

    return touchOverflowStyle;
  };

  _getThumbTouchRect = () => {
    const {state, props} = this;
    const touchOverflowSize = this._getTouchOverflowSize();

    return new Rect(
      touchOverflowSize.width / 2 +
        this._getThumbLeft(this._getCurrentValue()) +
        (state.thumbSize.width - props.thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 +
        (state.containerSize.height - props.thumbTouchSize.height) / 2,
      props.thumbTouchSize.width,
      props.thumbTouchSize.height,
    );
  };

  _renderDebugThumbTouchRect = (thumbLeft) => {
    const thumbTouchRect = this._getThumbTouchRect();
    const positionStyle = {
      left: thumbLeft,
      top: thumbTouchRect.y,
      width: thumbTouchRect.width,
      height: thumbTouchRect.height,
    };

    return (
      <Animated.View
        style={[defaultStyles.debugThumbTouchArea, positionStyle]}
        pointerEvents="none"
      />
    );
  };

  _renderThumbImage = () => {
    const {thumbImage, thumbContent} = this.props;

    if (!thumbImage && !thumbContent) return null;

    return thumbContent || <Image source={thumbImage} />;
  };

  render() {
    const {
      minimumValue,
      maximumValue,
      minimumTrackTintColor,
      maximumTrackTintColor,
      thumbTintColor,
      thumbImage,
      styles: stylesOverride,
      style,
      trackStyle,
      thumbStyle,
      debugTouchArea,
      onValueChange,
      thumbTouchSize,
      animationType,
      animateTransitions,
      thumbContent,
      ...other
    } = this.props;
    const {value, containerSize, thumbSize, allMeasured} = this.state;
    const mainStyles = stylesOverride || defaultStyles;
    const thumbLeft = value.interpolate({
      inputRange: [minimumValue, maximumValue],
      outputRange: [0, containerSize.width - thumbSize.width],
      // extrapolate: 'clamp',
    });
    const valueVisibleStyle = {};
    if (!allMeasured) {
      valueVisibleStyle.opacity = 0;
    }

    const minimumTrackStyle = {
      position: 'absolute',
      width: Animated.add(thumbLeft, thumbSize.width / 2),
      backgroundColor: minimumTrackTintColor,
      ...valueVisibleStyle,
    };

    const touchOverflowStyle = this._getTouchOverflowStyle();

    return (
      <View
        {...other}
        style={[mainStyles.container, style]}
        onLayout={this._measureContainer}
        pointerEvents="auto">
        <View
          style={[
            {backgroundColor: maximumTrackTintColor},
            mainStyles.track,
            trackStyle,
          ]}
          renderToHardwareTextureAndroid
        />
        <Animated.View
          renderToHardwareTextureAndroid
          style={[mainStyles.track, trackStyle, minimumTrackStyle]}
        />
        <Animated.View
          onLayout={this._measureThumb}
          renderToHardwareTextureAndroid
          style={[
            {backgroundColor: thumbTintColor},
            mainStyles.thumb,
            thumbStyle,
            {
              transform: [{translateX: thumbLeft}, {translateY: 0}],
              ...valueVisibleStyle,
            },
          ]}>
          {this._renderThumbImage()}
        </Animated.View>
        <View
          renderToHardwareTextureAndroid
          style={[defaultStyles.touchArea, touchOverflowStyle]}
          {...this._panResponder.panHandlers}>
          {debugTouchArea === true &&
            this._renderDebugThumbTouchRect(thumbLeft)}
        </View>
      </View>
    );
  }
}

const BasicSlider = ({
  step,
  value,
  style,
  thumbContent,
  minimumValue,
  maximumValue,
  onValueChange,
  thumbTintColor,
  thumbContrastColor,
}) => (
  <View style={[styles.container, style]} pointerEvents="auto">
    <Slider
      step={step}
      value={value}
      animateTransitions
      style={styles.slider}
      animationType="spring"
      thumbContent={thumbContent}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      onValueChange={onValueChange}
      thumbTouchSize={{width: 48, height: 48}}
      thumbStyle={[
        styles.thumb,
        {
          backgroundColor: thumbTintColor,
          shadowColor: thumbContrastColor,
          borderColor: `${thumbContrastColor}80`,
        },
      ]}
    />
  </View>
);

export default BasicSlider;

BasicSlider.propTypes = {
  step: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
  minimumValue: PropTypes.number.isRequired,
  maximumValue: PropTypes.number.isRequired,
  thumbTintColor: PropTypes.string.isRequired,
};
