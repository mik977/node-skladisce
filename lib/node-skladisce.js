
db = require('./db'),
service = require('./service');

/**
* Creates the server for the WebSCADA web service
* @param {object} options: options
*/
exports.start = function (options) {
  var server, emitter, body, router = service.createRouter();
  server = require('http').createServer(function (request, response) {
    body = '';
    request.on('data', function (chunk) {
      body += chunk;
    });
    request.on('end', function () {
      //
      // Dispatch the request to the router
      //
      var emitter = router.handle(request, body, function (route) {
        response.writeHead(route.status, route.headers);
        response.end(route.body);
      });
      /*
        emitter.on('log', function (info) {
        logger.info('Request completed', info);
        });
       */
    })
  });
  server.listen(options.port, options.host);
};