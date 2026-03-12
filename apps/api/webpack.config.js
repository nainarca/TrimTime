const { join } = require('path');

module.exports = {
  target: 'node',
  mode: 'development',
  entry: './apps/api/src/main.ts',
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};