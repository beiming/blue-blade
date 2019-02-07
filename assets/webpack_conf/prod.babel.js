import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CleanPlugin from "clean-webpack-plugin";
import CopyPlugin from 'copy-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import {CONFIG} from './_common';
import merge from "webpack-merge";
import base from "./base.babel";


const plugins = [
  new CleanPlugin(['*'], {root: path.resolve(CONFIG.paths.dist())}),
  new CopyPlugin([{
    from: CONFIG.paths.src('images/*'),
    to: 'images/[name]-[hash:8].[ext]',
    force: true
  }]),
  new MiniCssExtractPlugin({
    filename: 'css/[name].[hash].css',
    chunkFilename: 'css/[id].[hash].css',
  })
];

const optimization = {
  minimizer: [new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: true,
  }),
    new OptimizeCssAssetsPlugin({})
  ]
};

const rules = [
  {
    test: /\.(eot|woff|woff2|ttf)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: 'fonts/[name]-[hash:8].[ext]',
        publicPath: '/static/'
      }
    }]
  }, {
    test: /\.(svg|png|jpg|gif)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: 'images/[name]-[hash:8].[ext]',
        publicPath: '/static/'
      }
    }]
  }];

const config = {
  mode: 'production',
  output: {
    filename: 'js/[name]-[chunkhash:8].js',
    chunkFilename: 'js/[name]-[chunkhash:8].js',
  },
  module: {
    rules: rules,
  },
  plugins: plugins,
  optimization: optimization,
  devtool: 'none',
};

export default merge(base, config);
