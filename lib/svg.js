import React, {PureComponent} from 'react';
import {Svg, G, Path, Rect} from 'react-native-svg';

import smooth from './smooth';

const styles = {
  absfill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
};

class SmoothPath extends PureComponent {
  render() {
    const {
      path: {points, stroke = '#000000', strokeWidth = 1},
    } = this.props;
    return (
      <Path
        d={smooth(points)}
        strokeWidth={strokeWidth}
        stroke={stroke}
        fill="none"
      />
    );
  }
}

export class Background extends PureComponent {
  render() {
    const {transform, paths} = this.props;
    return (
      <Svg width="100%" height="100%" style={styles.absfill}>
        <G transform={transform}>
          <Rect x="0" y="0" width="100" height="100" fill="white" />
          {paths.map((path, i) => (
            <SmoothPath key={i} path={path} />
          ))}
        </G>
      </Svg>
    );
  }
}

export class Foreground extends PureComponent {
  render() {
    const {transform, currentPath} = this.props;
    return (
      <Svg width="100%" height="100%" style={styles.absfill}>
        <G transform={transform}>
          {currentPath ? <SmoothPath path={currentPath} /> : null}
        </G>
      </Svg>
    );
  }
}
