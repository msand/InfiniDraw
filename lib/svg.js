import React, { PureComponent } from 'react';

import { svgPath, bezierCommandCalc } from './smooth';

const styles = {
  absfill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
};

export default (Svg, G, Path, Rect) => {
  class SmoothPath extends PureComponent {
    render() {
      const { path } = this.props;
      return (
        <Path
          d={svgPath(path, bezierCommandCalc)}
          stroke="black"
          strokeWidth="1"
          fill="none"
        />
      );
    }
  }

  class Background extends PureComponent {
    render() {
      const { transform, paths } = this.props;
      return (
        <Svg width="100%" height="100%" style={styles.absfill}>
          <G transform={transform}>
            <Rect x="0" y="0" width="100" height="100" fill="white" />
            {paths.map((path, i) => <SmoothPath key={i} path={path} />)}
          </G>
        </Svg>
      );
    }
  }

  class Foreground extends PureComponent {
    render() {
      const { transform, currentPath } = this.props;
      return (
        <Svg width="100%" height="100%" style={styles.absfill}>
          <G transform={transform}>
            {currentPath ? <SmoothPath path={currentPath} /> : null}
          </G>
        </Svg>
      );
    }
  }

  return {
    Background,
    Foreground,
  };
};
