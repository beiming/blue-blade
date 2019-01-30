import glob from "glob";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CleanPlugin from "clean-webpack-plugin";
import CopyPlugin from 'copy-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';


const appName = 'app';
const CONFIG = {
  isProd: process.env.NODE_ENV === 'production',
  paths: {
    src: file => path.join('./', file || ''),
    dist: file => path.join('..', appName, 'static', file || '')
  }
};

function makeEntries() {
  const src = `./${CONFIG.paths.src('js')}/`;
  const entries = {};
  glob.sync(path.join(src, '**/main.js'))
    .map(file => `./${file}`)
    .forEach(file => {
      let name = path.dirname(file);
      name = name.substr(name.lastIndexOf('/') + 1);
      entries[name] = file;
    });
  return entries;
}

const plugins = [
  new CleanPlugin(CONFIG.isProd ? ['*'] : [], {root: path.resolve(CONFIG.paths.dist())}),
  new MiniCssExtractPlugin({
    filename: `css/${CONFIG.isProd ? '[name].[hash].css' : '[name].css'}`,
    chunkFilename: `css/${CONFIG.isProd ? '[id].[hash].css' : '[id].css'}`,
  }),
  new ManifestPlugin({
    filter: (file) => !file.name.endsWith('.map'),
    generate: (seed, files) => {
      let sysPath = path;
      return files.reduce((manifest, {name, path, isAsset}) => {
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
      }, seed)
    },
  }),
  new CopyPlugin([{
    from: CONFIG.paths.src('images/*'),
    to: CONFIG.isProd ? 'images/[name]-[hash:8].[ext]' : 'images/[name].[ext]', force: true
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
  },
  minimizer: [new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: !CONFIG.isProd,
  }),
    new OptimizeCssAssetsPlugin({})
  ]
};

const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: [/node_modules/],
    use: [{
      loader: 'babel-loader'
    }]
  }, {
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader',
      'sass-loader',
    ]
  }, {
    test: /\.(eot|woff|woff2|ttf)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: CONFIG.isProd ? 'fonts/[name]-[hash:8].[ext]' : 'fonts/[name].[ext]',
        publicPath: '/static/'
      }
    }]
  }, {
    test: /\.(svg|png|jpg|gif)$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: CONFIG.isProd ? 'images/[name]-[hash:8].[ext]' : 'images/[name].[ext]',
        publicPath: '/static/'
      }
    }]
  }];

const config = {
  entry: Object.assign({common: ['common']}, makeEntries()),
  output: {
    path: path.resolve(CONFIG.paths.dist()),
    filename: CONFIG.isProd ? 'js/[name]-[chunkhash:8].js' : 'js/[name].js',
    publicPath: '/',
    chunkFilename: CONFIG.isProd ? 'js/[name]-[chunkhash:8].js' : 'js/[name].js',
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
  devtool: CONFIG.isProd ? 'none' : 'cheap-module-source-map'
};

export default config;
