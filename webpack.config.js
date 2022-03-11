const path = require("path")

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/index.js"),
    pingone: path.resolve(__dirname, "./src/pingone.oidc.js"),
    pingas: path.resolve(__dirname, "./src/ping.as.oidc.js")
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: '[name].js',
    library: "pingDevLib",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  mode: "production",
}
