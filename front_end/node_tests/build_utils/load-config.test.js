const loadConfig = require('../../build_utils/load-config');
const presets = require('../../settings.default.conf.js');
const expect = require('expect');
const assign = Object.assign;
const path = require('path');
const localConfigFixture = require('./load-config.fixtures.js');

describe('loadConfig', function() {

  loadConfig.DEFAULTS.localConfigPath = path.join(__dirname, './doesntexist.js');

  it('should load development configuration', function() {
    expect(loadConfig()).toEqual(presets.development);
    expect(loadConfig({preset: 'development'})).toEqual(presets.development);
  });

  it('should load prod configuration', function() {
    expect(loadConfig({preset: 'production'})).toEqual(presets.production);
  });

  it('should pick up configuration from local file', function() {
    process.env.SPLICE_API_URL = 'http://foo.com';
    expect(loadConfig({
      preset: 'production',
      localConfigPath: path.join(__dirname, './load-config.fixtures.js')
    })).toEqual(assign({}, presets.production, localConfigFixture, {API_URL: 'http://foo.com'}));
    delete process.env.SPLICE_API_URL;
  });

  it('should pick up configuration from node env', function() {
    process.env.SPLICE_API_URL = 'http://foo.com';
    expect(loadConfig({
      preset: 'production',
      localConfigPath: path.join(__dirname, './load-config.fixtures.js')
    })).toEqual(assign({}, presets.production, localConfigFixture, {API_URL: 'http://foo.com'}));
    delete process.env.SPLICE_API_URL;
  });

  it('should not pick up configuration from node env or local config if allowOverride is false', function() {
    process.env.SPLICE_API_URL = 'http://foo.com';
    expect(loadConfig({preset: 'production', allowOverride: false})).toEqual(presets.production);
    delete process.env.SPLICE_API_URL;
  });

  it('should throw for invalid preset', function() {
    expect(function() {
      loadConfig({preset: 'boop'});
    }).toThrow('Preset boop does not exist in settings.default.conf.js');
  });

  it('should merge with supplied configuration', function() {
    const testConfig = {DEV_API: 'foo.com', foo: 'bar'};
    expect(loadConfig({preset: 'development', extend: testConfig})).toEqual(assign({}, presets.development, testConfig));
  });
});
