# Readme 

This project is based on [react-redux-scaffold](https://github.com/lcjnil/react-redux-scaffold).

Work in progress, issues are welcome.

## Config

Modify `settings.conf.js` variables `devApi` or `liveApi` with your API url. (Use single quotes within double quotes). 

Modify variables `devUrl` or `liveUrl` with the domain that the index.html will be served (http://localhost:9999/ for Dev). 

## Run

Install [node.js](https://nodejs.org/en/).

`npm install` to install dependencies.

`npm install gulp -g` install gulp.

`gulp serve` to start a local server with hot reloading.

`gulp build:dist` to build production code in the /dist directory.

`node node_modules/karma/bin/karma start` to run tests.

## Features

- ES6+ support
- Redux included (plus devtools)
- react-router
- Hot reload
- webpack

### Redux Filesystem

- write your reusable "dumb" components in `src/components`
- write your "smart" components in `src/pages`
- write your reducers in `src/reducers`
- write your actions in `src/actions`
- write your SASS in `src/styles`

