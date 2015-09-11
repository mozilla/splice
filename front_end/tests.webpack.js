//USE TO REQUIRE ALL
//var context = require.context('./tests', true, /.test\.js$/); 

//USE TO REQUIRE SPECIFIC TESTS
//var context = require.context('./tests', true, /main.test.js/); 
//var context = require.context('./tests/actions', true, /TodosAction.test.js/); 
var context = require.context('./tests/reducers', true, /AccountReducer.test.js/); 

context.keys().forEach(context);