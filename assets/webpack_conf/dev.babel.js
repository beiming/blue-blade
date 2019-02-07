import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from 'copy-webpack-plugin';
import {CONFIG} from './_common';
import merge from "webpack-merge";
import base from "./base.babel";


const plugins = [
  new MiniCssExtractPlugin({
    filename: 'css/[name].css',
    chunkFilename: 'css/[name].css',
  }),
  new CopyPlugin([{
    from: CONFIG.paths.src('images/*'),
    to: 'images/[name].[ext]',
    force: true
  }]),
];

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
    test: /\.(eot|woff|woff2|ttf)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: 'fonts/[name].[ext]',
        publicPath: '/static/'
      }
    }]
  }, {
    test: /\.(svg|png|jpg|gif)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: 'images/[name].[ext]',
        publicPath: '/static/'
      }
    }]
  }];

const config = {
  mode: 'production',
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  module: {
    rules: rules,
  },
  plugins: plugins,
  optimization: optimization,
  devtool: 'cheap-module-source-map',
};

export default merge(base, config);
