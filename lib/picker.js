import React, {PureComponent} from 'react';
import {
  TextInput,
  Text,
  View,
  Modal,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';

import {HueSlider, SaturationSlider, LightnessSlider} from './color-picker';
import Fade from './fade';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 4,
  },
  buttonSpacer: {
    width: 16,
  },
  headerButton: {
    fontSize: 17,
    lineHeight: 22,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowOffset: {width: 0, height: 2},
    backgroundColor: '#f6f8f8',
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontWeight: '600',
        letterSpacing: -0.41,
      },
    }),
  },
  content: {
    flex: 1,
    margin: 16,
  },
  lightText: {
    lineHeight: 22,
    fontSize: 17,
    color: 'white',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontWeight: '600',
        letterSpacing: -0.41,
      },
    }),
  },
  darkText: {
    lineHeight: 22,
    fontSize: 17,
    marginTop: 6,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      },
      ios: {
        fontWeight: '600',
        letterSpacing: -0.41,
      },
    }),
  },
  button: {
    flex: 1,
    borderRadius: 3,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modesRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mode: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginRight: 16,
  },
  modeActive: {
    backgroundColor: 'black',
    borderRadius: 3,
  },
  modeText: {
    lineHeight: 18,
    fontSize: 13,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
      ios: {
        fontWeight: '400',
        letterSpacing: -0.08,
      },
    }),
  },
  modeTextActive: {
    color: 'white',
  },
  sliders: {},
  sliderRow: {
    marginTop: 16,
    ...(Platform.OS === 'web' ? {cursor: 'ew-resize'} : {}),
  },
  colorString: {
    marginTop: 16,
    borderBottomWidth: 2,
    borderColor: '#DDDDDD',
  },
  colorStringText: {
    lineHeight: 24,
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: 'monospace',
      },
      ios: {
        fontFamily: 'Courier New',
        fontWeight: '600',
        letterSpacing: 0.75,
      },
    }),
  },
  swatchesText: {
    lineHeight: 18,
    fontSize: 13,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
      ios: {
        fontWeight: '400',
        letterSpacing: -0.08,
      },
    }),
    color: '#555',
  },
  swatchesContainer: {
    marginTop: 12,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  swatch: {
    width: '17.5%',
    aspectRatio: 1,
    maxHeight: 100,
    minHeight: 30,
    borderRadius: 3,
  },
};

const modes = {
  hex: {
    getString: (color) => tinycolor(color).toHexString(),
    label: 'HEX',
  },
  hsl: {
    getString: (color) => tinycolor(color).toHslString(),
    label: 'HSL',
  },
  hsv: {
    getString: (color) => tinycolor(color).toHsvString(),
    label: 'HSV',
  },
  rgb: {
    getString: (color) => tinycolor(color).toRgbString(),
    label: 'RGB',
  },
};

const Container = Platform.OS === 'web' ? Fade : Modal;

class Swatch extends PureComponent {
  selectSwatch = () => {
    const {onSelect, swatch} = this.props;
    return onSelect(swatch);
  };

  render() {
    const {swatch} = this.props;
    return (
      <TouchableOpacity
        style={[
          styles.swatch,
          {
            backgroundColor: swatch,
          },
        ]}
        onPress={this.selectSwatch}
      />
    );
  }
}

class Mode extends PureComponent {
  selectMode = () => {
    const {onSelect, mode} = this.props;
    return onSelect(mode);
  };

  render() {
    const {mode, selectedMode} = this.props;
    return (
      <TouchableOpacity
        onPress={this.selectMode}
        style={[styles.mode, selectedMode === mode && styles.modeActive]}>
        <Text
          style={[
            styles.modeText,
            selectedMode === mode && styles.modeTextActive,
          ]}>
          {modes[mode].label}
        </Text>
      </TouchableOpacity>
    );
  }
}

class SlidersColorPicker extends PureComponent {
  constructor(props) {
    super(props);
    const {color} = props;
    const hslColor = tinycolor(color).toHsl();
    this.state = {
      color: hslColor,
      text: null,
      mode: 'hex',
      prevColor: hslColor,
      fade: new Animated.Value(0),
    };
  }

  onOk = () => {
    const {onOk, returnMode} = this.props;
    const {color} = this.state;
    onOk(modes[returnMode].getString(color));
    this.setState({text: null});
  };

  onCancel = () => {
    const {onCancel} = this.props;
    onCancel();
    this.setState({text: null});
  };

  onChangeText = (text) => {
    const tiny = tinycolor(text);
    if (tiny.isValid()) {
      this.update(tiny.toHsl());
    } else {
      this.setState({text});
    }
  };

  update = (props) => {
    const {color, fade} = this.state;
    this.setState({
      color: {...color, ...props},
      prevColor: color,
      text: null,
    });
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 150,
    }).start();
  };

  updateHue = (h) => {
    this.update({h});
  };

  updateSaturation = (s) => {
    this.update({s});
  };

  updateLightness = (l) => {
    this.update({l});
  };

  selectSwatch = (swatch) => {
    this.update(tinycolor(swatch).toHsl());
  };

  selectMode = (mode) => {
    this.setState({mode, text: null});
  };

  render() {
    const {
      okLabel,
      visible,
      swatches,
      onCancel,
      cancelLabel,
      swatchesLabel,
    } = this.props;
    const {color, prevColor, text, mode, fade} = this.state;
    const colorRgb = tinycolor(color).toRgbString();
    const prevColorRgb = tinycolor(prevColor).toRgbString();
    const colorAnim = fade.interpolate({
      inputRange: [0, 1],
      outputRange: [prevColorRgb, colorRgb],
    });
    return (
      <Container
        visible={visible}
        style={styles.container}
        onRequestClose={onCancel}
        animationType="slide"
        transparent={false}>
        <View style={styles.container} pointerEvents="auto">
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.button,
                {
                  backgroundColor: colorAnim,
                },
              ]}>
              <Text style={styles.lightText}>LIGHT TEXT</Text>
              <Text style={styles.darkText}>DARK TEXT</Text>
            </Animated.View>
            <View style={styles.colorString}>
              <TextInput
                style={styles.colorStringText}
                value={text || modes[mode].getString(color)}
                onChangeText={this.onChangeText}
              />
            </View>
            <View style={styles.modesRow}>
              {Object.keys(modes).map((key) => (
                <Mode
                  key={key}
                  mode={key}
                  selectedMode={mode}
                  onSelect={this.selectMode}
                />
              ))}
            </View>
            <View style={styles.sliders}>
              <HueSlider
                onValueChange={this.updateHue}
                style={styles.sliderRow}
                gradientSteps={40}
                value={color.h}
              />
              <SaturationSlider
                onValueChange={this.updateSaturation}
                style={styles.sliderRow}
                gradientSteps={20}
                value={color.s}
                color={color}
              />
              <LightnessSlider
                onValueChange={this.updateLightness}
                style={styles.sliderRow}
                gradientSteps={20}
                value={color.l}
                color={color}
              />
            </View>
            <View style={styles.header}>
              <TouchableOpacity onPress={this.onCancel}>
                <Text style={[styles.headerButton]}>{cancelLabel}</Text>
              </TouchableOpacity>
              <View style={styles.buttonSpacer} />
              <TouchableOpacity onPress={this.onOk}>
                <Text style={[styles.headerButton]}>{okLabel}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.swatchesText}>{swatchesLabel}</Text>
            <View style={styles.swatchesContainer}>
              {swatches.map((swatch) => (
                <Swatch
                  key={swatch}
                  swatch={swatch}
                  onSelect={this.selectSwatch}
                />
              ))}
            </View>
          </View>
        </View>
      </Container>
    );
  }
}

export default SlidersColorPicker;

SlidersColorPicker.propTypes = {
  visible: PropTypes.bool.isRequired,
  swatches: PropTypes.arrayOf(PropTypes.string).isRequired,
  swatchesLabel: PropTypes.string.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  okLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  color: PropTypes.object.isRequired,
};

SlidersColorPicker.defaultProps = {
  okLabel: 'Ok',
  cancelLabel: 'Cancel',
};
