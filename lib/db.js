/*
* hist.js: Top-level include for the DbAPI module.
*
* (C) 2012 LiNK d.o.o.
*
*/

var fb = require('node-firebird'),
    extend = require('extend');

/**
* Constructor function for the DbAPI object..
* @constructor
*/
var DbAPI = function () {
  this.conf = {
    host: '127.0.0.1',
    port: 3050,
    auth: 'SYSDBA:masterkey',
    database: 'avtojung',
    options: undefined
  };
};

DbAPI.instance = null;

DbAPI.getInstance = function () {
  if(this.instance === null){
    this.instance = new DbAPI();
  }
  return this.instance;
};

module.exports = DbAPI.getInstance();

/**
 * Setup connection
 * @param {object} conf: Conf
 */
DbAPI.prototype.setup = function(conf) {
  if (conf) {
    extend(this.conf,conf);
  }
  var auth = conf.auth.split(':');
  this.conf.user = auth[0];
  this.conf.password = auth[1];
}

/**
 * Open connection
 * @param {function} callback: Callback
 */
DbAPI.prototype.open = function (callback) {
  var self = this;
  fb.attach(this.conf,function(err, db){
    if (err) {
      callback(err);
    } else {
      self.db = db;
      callback(null);
    };
  });
};

/**
* Close connection
*/
DbAPI.prototype.close = function () {
  this.db.detach();
};

/**
* Get SELECT from DB
 * @param {function} callback: Callback function
*/
DbAPI.prototype.select = function (sql, callback) {
  this.db.query(sql,function (err,result) {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

