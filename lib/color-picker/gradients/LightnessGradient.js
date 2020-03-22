import React, {Component} from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import Gradient from './Gradient';

class LightnessGradient extends Component {
  shouldComponentUpdate(nextProps) {
    const {color} = this.props;
    const {color: nextColor} = nextProps;
    return color.h !== nextColor.h || color.s !== nextColor.s;
  }

  getStepColor = (i) => {
    const {color} = this.props;
    return tinycolor({...color, l: i}).toHexString();
  };

  render() {
    const {style, gradientSteps} = this.props;
    return (
      <Gradient
        name="light"
        style={style}
        gradientSteps={gradientSteps}
        getStepColor={this.getStepColor}
        maximumValue={1}
      />
    );
  }
}

export default LightnessGradient;

LightnessGradient.propTypes = {
  color: PropTypes.shape({
    h: PropTypes.number.isRequired,
    s: PropTypes.number.isRequired,
    l: PropTypes.number.isRequired,
  }).isRequired,
  gradientSteps: PropTypes.number.isRequired,
};
