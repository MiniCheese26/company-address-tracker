const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

module.exports = {
  target: 'electron-renderer',
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    alias: {
      'App': path.resolve(__dirname, './src/app'),
      'Types': path.resolve(__dirname, './src/app/types'),
      'Styles': path.resolve(__dirname, './src/app/styles'),
      'Components': path.resolve(__dirname, './src/app/components'),
      'Resources': path.resolve(__dirname, './src/app/resources'),
      'Sql': path.resolve(__dirname, './src/sql')
    }
  },
};
