// Update these to match your package scope name.
const internalNodeModulesRegExp = /(?:zoomable-svg|react-native-svg|react-native-color|react-native-slider)(?!.*node_modules)/;
const externalNodeModulesRegExp = /node_modules(?!\/(?:zoomable-svg|react-native-color|react-native-svg|react-native-slider)(?!.*node_modules))/;

module.exports = {
  webpack: (config, { dev, isServer, defaultLoaders }) => {
    config.resolve.symlinks = false;
    config.externals = config.externals.map(external => {
      if (typeof external !== 'function') return external;
      return (ctx, req, cb) =>
        internalNodeModulesRegExp.test(req) ? cb() : external(ctx, req, cb);
    });
    defaultLoaders.babel.options.plugins = [[
      'babel-plugin-module-resolver',
      {
        alias: {
          '^react-native$': 'react-native-web',
        },
      },
    ]];
    config.module.rules.push({
      test: /\.+(js|jsx)$/,
      loader: defaultLoaders.babel,
      include: [internalNodeModulesRegExp],
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native-svg': 'svgs',
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = ['.web.js', '.js'];
    return config;
  },
  webpackDevMiddleware: config => {
    config.watchOptions.ignored = [
      config.watchOptions.ignored[0],
      externalNodeModulesRegExp,
    ];
    return config;
  },
};
