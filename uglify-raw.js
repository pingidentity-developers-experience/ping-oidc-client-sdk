// This is used to minify src/utilities/worker-thread.js since we need to pull it in as a raw string

// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const UglifyJS = require('uglify-js');

module.exports = function minifyLoader(source) {
  return UglifyJS.minify(source, { toplevel: true }).code;
};
