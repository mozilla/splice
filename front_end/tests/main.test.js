var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils'); //I like using the Test Utils, but you can just use the DOM API instead.
var expect = require('expect');
var Main = require('../src/main'); //my root-test lives in components/__tests__/, so this is how I require in my components.
var assert = require('assert');

describe('main', function () {
  it('renders without problems', function () {
    var main = TestUtils.renderIntoDocument(<Main/>);
    expect(main).toExist();
  });
});
