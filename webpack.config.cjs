const path = require('path');

module.exports = {
  mode: 'development',
  entry: './server.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util"),
      "os": require.resolve("os-browserify/browser"),
      "querystring": require.resolve("querystring-es3"),
      "url": require.resolve("url"),
      "buffer": require.resolve("buffer/"),
      "http": require.resolve("stream-http"),
      "timers": require.resolve("timers-browserify"),
      "process": require.resolve("process/browser"),
      "net": false,
      "tls": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  target: 'node', // Définir si ton code est destiné à Node.js
};
