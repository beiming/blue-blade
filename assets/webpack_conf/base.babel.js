import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {CONFIG, makeEntries} from './_common';

const optimization = {
  splitChunks: {
    chunks: "all",
    minSize: 30000,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
      vendor: {
        chunks: "all",
        test: /[\\/]node_modules[\\/]/,
        minChunks: 1,
        minSize: 0,
        priority: 100,
        enforce: true,
        reuseExistingChunk: true
      }
    }
  },
  runtimeChunk: {
    name: 'manifest'
  }
};

const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: [/node_modules/],
    use: [{
      loader: 'babel-loader'
    }]
  }, {
    test: /\.(css|scss)$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader',
      'sass-loader',
    ]
  }];

const config = {
  entry: Object.assign({common: ['common']}, makeEntries()),
  output: {
    path: path.resolve(CONFIG.paths.dist()),
    publicPath: '/',
  },
  resolve: {
    alias: {
      common: `./${CONFIG.paths.src('js')}/common/index.js`
    },
    extensions: ['.js', '.jsx', '.css', '.scss', '.json']
  },
  module: {
    rules: rules,
  },
  plugins: [],
  optimization: optimization,
};

export default config;
