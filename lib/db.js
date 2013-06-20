/*
* hist.js: Top-level include for the DbAPI module.
*
* (C) 2012 LiNK d.o.o.
*
*/

var exec = require('child_process').exec;
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
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

