/*
* helpers.js: Helper functions for the pinpoint web service.
*
* (C) 2011 Charlie Robbins
* MIT LICENSE
*
*/

var journey = require('journey');
var fs = require('fs');
var pass = require('pass');

/**
* randomString returns a pseude-random ASCII string which contains at least the specified number of bits of entropy
* the return value is a string of length .bits/6. of characters from the base64 alphabet
* @param {int} bits: Number of bits to use for the randomString
*
*/
var randomString = exports.randomString = function (bits) {
  var chars, rand, i, ret;

  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  ret = '';

  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while (bits > 0) {
    // 32-bit integer
    rand = Math.floor(Math.random() * 0x100000000);
    // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
    for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
      ret += chars[0x3F & rand >>> i];
    }
  }

  return ret;
};

var base64 = exports.base64 = {
  encode: function (unencoded) {
    return new Buffer(unencoded || '').toString('base64');
  },

  decode: function (encoded) {
    return new Buffer(encoded || '', 'base64').toString('utf8');
  }
};

var savePw = function (pwFile, logins, callback) {
  var user, data = [];
  for (user in logins) {
    data.push(user+':'+logins[user]);
  }
  data = data.join("\n");
  fs.writeFile(pwFile, data, 'utf8', function (err) {
    if (err) return callback(false,"Error occured: "+err);
    callback(true);
  });
};

var managePw = exports.managePw = function (conf, callback) {
  var pwFile = auth.passwd_file;
  fs.readFile(pwFile, 'utf8', function (err, data) {
    if (err) return callback(false,"Error occured: "+err);

    var datalines = data.split("\n");
    var i, line, logins={};
    for (i=0; i<datalines.length; i++) {
      line = datalines[i];
      ar = line.split(":");
      if (ar.length==2) {
        logins[ar[0]] = ar[1];
      }
    }
    
    if (conf.action == 'check') {
      var user = conf.user, pw = conf.pw;
      if (user in logins) {
        pass.validate(pw, logins[user], function(error,success){
          if (error) {
            return callback(false,"Error occured: "+error.message);
          }
          if (!success) {
            return callback(false,"Passwords did not match!");
          }
          return callback(true);
        });
      } else {
        callback(false,"No user: "+user);
      }
    } else if (conf.action == 'add' || conf.action == 'mod' || conf.action == 'del') {
      if (conf.action == 'del') {
        delete logins[conf.user];
        savePw(pwFile,logins,callback);
      } else {
        pass.generate(conf.pw, function(error, hash){
          if(error){
            return callback(false,"Error occured: "+error.message);
          }
          logins[conf.user] = hash;
          savePw(pwFile,logins,callback);
        });
      }
    }
  });
};

var clone = exports.clone = function(obj){ 
  return JSON.parse(JSON.stringify(obj));
};

var auth = exports.auth = {
  passwd_file: null,
  basicAuth: function (request, body, callback) {
    if (!auth.passwd_file) {
      return callback(null);
    }
    
    if (callback == undefined) {
      callback = function(){
        return;
      }
    }

    var authorization = request.headers.authorization;
    if (!authorization) {
      if (request.query && request.query.username && request.query.password) {
        authorization = 'Basic ' + base64.encode(request.query.username + ':' + request.query.password);
      } else {
        var responseObj = {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="WebSCADA APP Server"'
          },
          body: {}
        };
        return callback(responseObj);
      }
    }

    var parts = authorization.split(" "), scheme = parts[0];
    if (scheme == 'Basic') {
      var credentials = base64.decode(parts[1]).split(":"); // admin:password
      if(!credentials[0] && !credentials[1]){
        return callback(new journey.NotAuthorized('Wrong credentials!'));
      }
      managePw({user:credentials[0],pw:credentials[1],action:'check'},function(authorized,msg){
        if (!authorized) {
          return callback(new journey.NotAuthorized(msg));
        }
        callback(null);
      });
    } else {
      return callback(new journey.NotAuthorized("Unknown authorization scheme!"));
    }
  }
};
