const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    mode: argv.mode || 'development',
    devtool: isDevelopment ? 'inline-source-map' : false,

    entry: {
      background: './src/background/background.ts',
      content: './src/content/content.ts',
      inject: './src/content/inject.ts',
      popup: './src/popup/index.tsx',
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@/services': path.resolve(__dirname, 'src/services'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/constants': path.resolve(__dirname, 'src/constants'),
      },
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'public', to: '.' },
          { from: 'src/popup/popup.html', to: 'popup.html' },
        ],
      }),
    ],

    optimization: {
      minimize: !isDevelopment,
    },
  };
};

