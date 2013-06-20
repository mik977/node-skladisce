/*
* hist.js: Top-level include for the DbAPI module.
*
* (C) 2012 LiNK d.o.o.
*
*/

var exec = require('child_process').exec;
var helpers = require('./helpers');

/**
* Constructor function for the DbAPI object..
* @constructor
*/
var DbAPI = function () {
  this.conf = {
    cmd: 'isql -u SYSDBA -p masterkey',
    database: 'avtojung'
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
* Get SELECT from DB
 * @param {function} sql: Sql file
 * @param {function} callback: Callback function
*/
DbAPI.prototype.select = function (sql, callback) {
  var cmd = this.conf.cmd + ' -i ' + sql + ' ' + this.conf.database;
  
  var child = exec(cmd,function (error, stdout, stderr) {
    if (error !== null) {
      callback(error);
      console.log('exec error: ' + error);
      return;
    }
    if (stderr !== null) {
      console.log('stderr: ' + stderr);
      callback(stderr);
      return;
    }
    var obj=null, arr=[];
    var name, val, line, lines = stdout.split("\n");
    for (var i=0; i<lines.length; i++) {
      line = helpers.trim(lines[i]);
      if (line=="") {
        if (obj) {
          arr.push(obj);
        }
        obj = {};
      } else {
        name = helpers.trim(line.substr(0,32));
        val = helpers.trim(line.substr(32));
        obj[name] = val;
      }
    }
    callback(null,arr);
  });
};

