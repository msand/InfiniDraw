import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import Slider from 'react-native-slider';

const BasicSlider = ({
  style,
  value,
  step,
  minimumValue,
  maximumValue,
  gradient,
  onValueChange,
  thumbTintColor,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Slider
        value={value}
        step={step}
        animateTransitions
        animationType="spring"
        thumbTouchSize={{ width: 48, height: 48 }}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        onValueChange={onValueChange}
        thumbStyle={[styles.thumb, { backgroundColor: thumbTintColor }]}
      />
    </View>
  );
};

export default BasicSlider;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 32,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
});

BasicSlider.propTypes = {
  value: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  maximumValue: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
  thumbTintColor: PropTypes.string.isRequired,
};
