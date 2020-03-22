import React from 'react';
import PropTypes from 'prop-types';
import {Svg, Rect, LinearGradient, Defs, Stop} from 'react-native-svg';

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
};

const Gradient = ({name, style, gradientSteps, maximumValue, getStepColor}) => {
  const rows = [];
  for (let i = 0; i <= gradientSteps; i++) {
    const ratio = i / gradientSteps;
    rows.push(
      <Stop
        key={i}
        offset={`${ratio * 100}%`}
        stopColor={getStepColor(ratio * maximumValue)}
      />,
    );
  }
  const id = `Gradient${name}`;
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{...styles.container, ...style}}>
      <Defs>
        <LinearGradient id={id}>{rows}</LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
    </Svg>
  );
};

export default Gradient;

Gradient.propTypes = {
  gradientSteps: PropTypes.number.isRequired,
  maximumValue: PropTypes.number.isRequired,
  getStepColor: PropTypes.func.isRequired,
};
