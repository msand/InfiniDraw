import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import Gradient from './Gradient';

class HueGradient extends PureComponent {
  getStepColor = (i) => tinycolor({s: 1, l: 0.5, h: i}).toHexString();

  render() {
    const {style, gradientSteps} = this.props;
    return (
      <Gradient
        name="hue"
        style={style}
        gradientSteps={gradientSteps}
        getStepColor={this.getStepColor}
        maximumValue={359}
      />
    );
  }
}

export default HueGradient;

HueGradient.propTypes = {
  gradientSteps: PropTypes.number.isRequired,
};
