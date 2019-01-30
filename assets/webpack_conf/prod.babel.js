import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CleanPlugin from "clean-webpack-plugin";
import CopyPlugin from 'copy-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import {CONFIG} from './_common';
import merge from "webpack-merge";
import base from "./base.babel";

let sysPath = path;
const generateManiFestReducer = (manifest, {name, path, isAsset}) => {
  // fix path start with /
  if (path.startsWith('/')) {
    path = path.substr(1);
  }

  // fix name not include directory
  let slashIndex = path.indexOf('/');
  if (slashIndex !== -1) {
    let dir = path.substring(0, slashIndex + 1);
    if (!name.startsWith(dir)) {
      name = dir + name;
    }
  }

  // fix asset in css map error
  if (isAsset) {
    let dirName = sysPath.dirname(path);
    let extName = sysPath.extname(path);
    let baseName = sysPath.basename(path, extName);

    let minusIndex = baseName.lastIndexOf('-');
    let hash = '';
    if (minusIndex !== -1) {
      hash = baseName.substr(minusIndex + 1);
      if (hash.length === 8) {
        baseName = baseName.substr(0, minusIndex);
      }
    }
    let nameFromPath = sysPath.join(dirName, baseName + extName);
    if (nameFromPath !== name) {
      name = nameFromPath;
    }
  }

  // copy resources have the lowest priority
  if (manifest[name] && manifest[name].length > path.length) {
    path = manifest[name];
  }

  return {...manifest, [name]: path};
};


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
  }),
  new ManifestPlugin({
    filter: (file) => !file.name.endsWith('.map'),
    generate: (seed, files) => files.reduce(generateManiFestReducer, seed)
  }),
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
