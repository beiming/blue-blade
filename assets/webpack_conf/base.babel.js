import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {CONFIG, makeEntries} from './_common';
import ManifestPlugin from "webpack-manifest-plugin";

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

const plugins = [
  new ManifestPlugin({
    filter: (file) => !file.name.endsWith('.map'),
    generate: (seed, files) => files.reduce(generateManiFestReducer, seed)
  }),
];

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
  plugins: plugins,
  optimization: optimization,
};

export default config;
