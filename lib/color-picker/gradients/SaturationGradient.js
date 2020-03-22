import React, {Component} from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import Gradient from './Gradient';

class SaturationGradient extends Component {
  shouldComponentUpdate(nextProps) {
    const {color} = this.props;
    const {color: nextColor} = nextProps;
    return color.h !== nextColor.h || color.l !== nextColor.l;
  }

  getStepColor = (i) => {
    const {color} = this.props;
    return tinycolor({...color, s: i}).toHexString();
  };

  render() {
    const {style, gradientSteps} = this.props;
    return (
      <Gradient
        style={style}
        name="saturation"
        gradientSteps={gradientSteps}
        getStepColor={this.getStepColor}
        maximumValue={1}
      />
    );
  }
}

export default SaturationGradient;

SaturationGradient.propTypes = {
  color: PropTypes.shape({
    h: PropTypes.number.isRequired,
    s: PropTypes.number.isRequired,
    l: PropTypes.number.isRequired,
  }).isRequired,
  gradientSteps: PropTypes.number.isRequired,
};
