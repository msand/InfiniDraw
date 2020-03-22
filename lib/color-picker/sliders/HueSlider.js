import React from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';

import GradientSlider from './GradientSlider';
import HueGradient from '../gradients/HueGradient';

const HueSlider = ({style, value, onValueChange, gradientSteps}) => (
  <GradientSlider
    gradient={<HueGradient gradientSteps={gradientSteps} />}
    style={style}
    step={1}
    maximumValue={359}
    value={value}
    thumbTintColor={tinycolor({s: 1, l: 0.5, h: value}).toHslString()}
    onValueChange={onValueChange}
  />
);

export default HueSlider;

HueSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
  gradientSteps: PropTypes.number.isRequired,
};
