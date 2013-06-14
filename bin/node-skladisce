#!/usr/bin/env node

Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});

var util = require('util'),
    url = require('url'),
    fs = require('fs'),
    argv = require('optimist').argv;

var help = [
    "usage: server [options]",
    "",
    "JUNG App Server",
    "",
    "options:",
    " -n Host that you want the home server to run on [127.0.0.1]",
    " -p Port that you want the home server to run on [8000]",
    " -a, --auth password_file to use for HTTP Basic Auth [none]",
    " -g, --genpasswd username:password generate password and append to password_file [none]",
    " -f, --fbconn firebird://username:password@host:port/database use this connection string for firebird [firebird://SYSDBA:masterkey@127.0.0.1:3050/avtojung]",
    " -x, --api API key to use for API key Auth [none]",
    " -h, --help You're staring at it",
].join('\n');

if (argv.h || argv.help) {
  return util.puts(help);
}

if (argv.g || argv.genpasswd) {
  var upass = argv.g || argv.genpasswd || '';
  var ar = upass.split(':');
  if (ar.length == 2) {
    pass = require('pass');
    pass.generate(ar[1], function(error, hash) {
      if(error){
        return console.log("Error: "+error.message);
      }
      return console.log(ar[0]+':'+hash);
    });
  }
} else {
  var fbconn = url.parse(argv.f || argv.fbconn || 'firebird://SYSDBA:masterkey@127.0.0.1:3050/avtojung');
  var options = {
    host: argv.n || '0.0.0.0',
    port: argv.p || 8000,
    firebird: {
      host: fbconn.hostname || '127.0.0.1',
      port: fbconn.port || 3050,
      auth: fbconn.auth || 'SYSDBA:masterkey',
      database: fbconn.pathname ? fbconn.pathname.substr(1) : 'avtojung'
    },
    basicAuth: argv.a || argv.auth || null,
    apiKey: argv.x || argv.api || 'e7d778c5-a349-4c60-a573-4b9955bebd93'
  };

  if (options.basicAuth) {
    helpers.auth.passwd_file = options.basicAuth;
  }
  
  require('../lib/node-skladisce').start(options);
}