import React, {PureComponent} from 'react';
import {Animated} from 'react-native';

export default class Fade extends PureComponent {
  constructor(props) {
    super(props);
    const {visible} = props;
    this.state = {
      visible,
    };
    const visibleAnim = new Animated.Value(visible ? 1 : 0);
    this.visibleAnim = visibleAnim;
    this.containerStyle = {
      opacity: visibleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          scale: visibleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1.1, 1],
          }),
        },
      ],
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.visible) {
      return {visible: true};
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    const {visible} = this.props;
    if (prevProps.visible === visible) {
      return;
    }
    Animated.timing(this.visibleAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
    }).start(() => {
      this.setState({visible});
    });
  }

  render() {
    const {style, children} = this.props;
    const {visible} = this.state;
    return (
      <Animated.View
        style={visible ? [this.containerStyle, style] : this.containerStyle}>
        {visible ? children : null}
      </Animated.View>
    );
  }
}
