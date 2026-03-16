const { join, resolve } = require('path');

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
    alias: {
      '@trimtime/shared': resolve(__dirname, '../../libs/shared/src/index.ts'),
      '@trimtime/shared-types': resolve(__dirname, '../../libs/shared-types/src/index.ts'),
      '@trimtime/shared-utils': resolve(__dirname, '../../libs/shared-utils/src/index.ts'),
      '@trimtime/queue-engine': resolve(__dirname, '../../libs/queue-engine/src/index.ts'),
      '@trimtime/graphql-schema': resolve(__dirname, '../../libs/graphql-schema/src/index.ts'),
      '@trimtime/ui-components': resolve(__dirname, '../../libs/ui-components/src/index.ts'),
      '@trimtime/auth': resolve(__dirname, '../../libs/auth/src/index.ts'),
    },
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