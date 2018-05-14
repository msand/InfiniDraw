module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  plugins: ['prettier'],
  parser: 'babel-eslint',
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'prettier/prettier': ['error', { singleQuote: true, trailingComma: 'all' }],
    'react/require-default-props': 0,
    'react/no-array-index-key': 0,
    'react/forbid-prop-types': 0,
    'no-underscore-dangle': 0,
    'react/no-multi-comp': 0,
    'react/prop-types': 0,
    'no-plusplus': 0,
  },
};
