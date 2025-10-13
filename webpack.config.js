const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

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
          use: ['style-loader', 'css-loader', 'postcss-loader'],
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
      new webpack.DefinePlugin({
        'process.env.MONEY_AUTH_URL': JSON.stringify(
          process.env.MONEY_AUTH_URL || 'http://localhost:8787'
        ),
        'process.env.CHAIN_ID': JSON.stringify(process.env.CHAIN_ID || '102031'),
        'process.env.ONE_P_CONTRACT_ADDRESS': JSON.stringify(
          process.env.ONE_P_CONTRACT_ADDRESS || ''
        ),
        'process.env.EVM_CREATOR_PRIVATE_KEY': JSON.stringify(
          process.env.EVM_CREATOR_PRIVATE_KEY || ''
        ),
      }),
    ],

    optimization: {
      minimize: !isDevelopment,
    },
  };
};

