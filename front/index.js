const connect = require('connect');
const serve_static = require('serve-static');

const server = connect();
server.use(serve_static(__dirname + '/'));

server.listen(3000);

const livereload = require('livereload');
const liveserver = livereload.createServer();
liveserver.watch(__dirname + "/");