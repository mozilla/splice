//USE TO REQUIRE ALL
var context = require.context('./tests', true, /.test\.js$/);

//USE TO REQUIRE SPECIFIC TESTS
//var context = require.context('./tests/actions/Accounts', true, /AccountActions.test.js/);
//var context = require.context('./tests/reducers', true, /AccountReducer.test.js/);

context.keys().forEach(context);