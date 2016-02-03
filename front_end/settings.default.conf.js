// Note:
// To override this configuration,
// create a file at front_end/settings.conf.js
// and export a single object, e.g.
// module.exports = {
//   API_URL: 'http://localhost:1989',
//   ...
// }

exports.development = {
  ENV: 'development',
  API_URL: 'http://localhost:5000',
  DEVELOPMENT: true,
  DEVTOOLS: false,
  WEBPACK_PUBLIC_PATH: 'http://localhost:9999/'
};

exports.production = {
  ENV: 'production',
  API_URL: '',
  DEVELOPMENT: false,
  DEVTOOLS: false,
  WEBPACK_PUBLIC_PATH: '/static/build/campaign-manager/'
};

exports.test = {
  ENV: 'test',
  API_URL: '',
  DEVELOPMENT: false,
  DEVTOOLS: false
};
