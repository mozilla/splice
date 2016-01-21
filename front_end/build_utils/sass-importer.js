const path = require('path');
const Map = require('es6-map');
const npmResolve = require('resolve');
const fs = require('fs');

function find(file) {
  // console.log(file);
  return new Promise((resolve) => {
    npmResolve(file, (err, res) => resolve(err ? file : res));
  });
}

function processCSS(file, done) {
  fs.readFile(file, 'utf8', function (err, contents) {
    if (err) throw err;
    done({ contents });
  });
}

module.exports = function(url, prev, done) {

  const aliases = new Map();

  if (aliases.has(url)) {
    return done({ file: aliases.get(url) });
  }

  find(url).then((file) => {
    aliases.set(url, file);
    if (file.match(/\.css$/)) {
      processCSS(file, done);
    } else {
      done({ file });
    }
  });

};

