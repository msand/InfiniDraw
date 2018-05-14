import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-native-slider';
import { Platform, StyleSheet, View } from 'react-native';

const BasicSlider = ({
  step,
  value,
  style,
  minimumValue,
  maximumValue,
  onValueChange,
  thumbTintColor,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Slider
        step={step}
        value={value}
        animateTransitions
        style={styles.slider}
        animationType="spring"
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        onValueChange={onValueChange}
        thumbTouchSize={{ width: 48, height: 48 }}
        thumbStyle={[styles.thumb, { backgroundColor: thumbTintColor }]}
      />
    </View>
  );
};

export default BasicSlider;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: 32,
  },
  thumb: {
    width: 24,
    height: 24,
    shadowRadius: 4,
    borderRadius: 12,
    shadowOpacity: 0.1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
  },
  slider: Platform.OS === 'web' ? { cursor: 'ew-resize' } : {},
});

BasicSlider.propTypes = {
  step: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
  minimumValue: PropTypes.number.isRequired,
  maximumValue: PropTypes.number.isRequired,
  thumbTintColor: PropTypes.string.isRequired,
};
