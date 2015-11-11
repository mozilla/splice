# Readme 

This project is based on [react-redux-scaffold](https://github.com/lcjnil/react-redux-scaffold).

Work in progress, issues are welcome.

## Config

Modify `settings.conf.js` variables `devApi` or `liveApi` with your API url. (Use single quotes within double quotes).  

## Run

Install [node.js](https://nodejs.org/en/).

`npm install` to install dependencies.


`npm start` to start a local server with hot reloading.

`npm run build:dist` to build production code in the /dist directory.

`npm test` to run tests.

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

