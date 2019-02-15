module.exports = {
  webpack: (config, params) => {
    const { defaultLoaders } = params;
    const newConf = config;
    defaultLoaders.babel.options.plugins = [
      [
        'babel-plugin-module-resolver',
        {
          alias: {
            '^react-native$': 'react-native-web',
          },
        },
      ],
    ];
    newConf.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    newConf.resolve.extensions = ['.web.js', '.js'];
    return newConf;
  },
};
