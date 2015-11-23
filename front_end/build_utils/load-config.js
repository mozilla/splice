'use strict';
const assign = require('lodash').assign;
const DEFAULT_CONFIG = require('../settings.default.conf.js');
const DEFAULT_OPTIONS = {
  preset: 'development',
  allowOverride: true,
  extend: {},
  nodeEnvPrefix: 'SPLICE_',
  localConfigPath: '../settings.conf.js'
};


// This file loads configuration from 3 places:
// From an override object passed in
// From process.env (note: env variables are prefixed with SPLICE);
// From settings.default.conf.js
// From settings.conf.js
module.exports = function loadConfig(options) {

  options = assign(DEFAULT_OPTIONS, options || {});

  if (!(options.preset in DEFAULT_CONFIG)) {
    throw new Error(`Preset ${options.preset} does not exist in settings.default.conf.js`);
  }

  const config = assign({}, DEFAULT_CONFIG[options.preset]);

  if (options.allowOverride) {
    // Add local config file
    try {
      const localConfig = require(options.localConfigPath) || {};
      assign(config, localConfig);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        console.log(`No local settings file found at ${options.localConfigPath}\n`);
      } else {
        throw err;
      }
    }

    // Add node environment
    Object.keys(config).forEach(key => {
      if (typeof process.env[options.nodeEnvPrefix + key] !== 'undefined') {
        config[key] = process.env[options.nodeEnvPrefix + key];
      }
    });
  }

  // Add extend option
  assign(config, options.extend);

  console.log(config);

  return config;
};

module.exports.DEFAULTS = DEFAULT_OPTIONS;
