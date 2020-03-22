import React from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';

import GradientSlider from './GradientSlider';
import SaturationGradient from '../gradients/SaturationGradient';

const SaturationSlider = ({
  style,
  value,
  color,
  onValueChange,
  gradientSteps,
}) => (
  <GradientSlider
    gradient={
      <SaturationGradient color={color} gradientSteps={gradientSteps} />
    }
    style={style}
    step={0.01}
    maximumValue={1}
    value={value}
    thumbTintColor={tinycolor({...color, s: value}).toHslString()}
    onValueChange={onValueChange}
  />
);

export default SaturationSlider;

SaturationSlider.propTypes = {
  value: PropTypes.number.isRequired,
  color: PropTypes.shape({
    h: PropTypes.number.isRequired,
    s: PropTypes.number.isRequired,
    l: PropTypes.number.isRequired,
  }).isRequired,
  onValueChange: PropTypes.func.isRequired,
  gradientSteps: PropTypes.number.isRequired,
};
