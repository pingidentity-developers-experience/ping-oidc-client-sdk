const path = require("path")

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/index.ts"),
    pingone: path.resolve(__dirname, "./src/pingone.ts"),
    pingas: path.resolve(__dirname, "./src/pingas.ts")
  },
  output: {
    path: path.resolve(__dirname, "./dist/"),
    filename: '[name].js',
    library: "pingDevLib",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  mode: "production",
}
