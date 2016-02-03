const path = require('path');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));

if (!args['base-path']) throw new Error('You must include a base path');
if (!args.o) throw new Error('You must include an output path');

function generateHTML(basePath) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title></title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="shortcut icon" type="image/x-icon" href="${path.join(basePath, 'public/img/favicon.ico')}">
  <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800|Montserrat:400,700' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" type="text/css" href="${path.join(basePath, 'main.css')}">
</head>
<body>
  <!--[if lt IE 8]>
  <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade
    your browser</a> to improve your experience.</p>
  <![endif]-->
  <div id="content">
    <p>Loading...</p>
  </div>

  <script type="text/javascript" src="${path.join(basePath, 'main.js')}"></script>
</body>
</html>
`;
};

fs.writeFileSync(path.join(args.o, 'index.html'), generateHTML(args['base-path']), 'utf-8');
