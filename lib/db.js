/*
* hist.js: Top-level include for the DbAPI module.
*
* (C) 2012 LiNK d.o.o.
*
*/

var helpers = require('./helpers');
var fs = require('fs');

/**
* Constructor function for the DbAPI object..
* @constructor
*/
var DbAPI = function () {
  this.conf = {
    cmd: 'isql',
    args: ['-q', '-u', 'SYSDBA', '-p', 'masterkey', '-ch', 'UTF-8', '-i', 'tmpfile.sql', 'avtojung']
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
  var sql_script="";
  
  sql_script += "set heading;\n";
  sql_script += "set list;\n";
  sql_script += sql+"\n";

  fs.writeFileSync('tmpfile.sql',sql_script);
  
  var isql = require('child_process').spawn(this.conf.cmd, this.conf.args);
  
  var buff = "";
  
  isql.stdout.on('data', function (data) {
    buff += data;
  });
  
  isql.stderr.on('data', function (data) {
    callback(err);
  });
  
  isql.on('close', function (code) {
    var obj={}, arr=[];
    var name, val, line, lines = helpers.trim(buff).split("\n");
    for (var i=0; i<lines.length; i++) {
      line = helpers.trim(lines[i]);
      if (line=="") {
        arr.push(obj);
        obj = {};
      } else {
        name = helpers.trim(line.substr(0,32)).toLowerCase();
        val = helpers.trim(line.substr(32));
        if (val == '<null>') val = null;
        obj[name] = val;
      }
    }
    arr.push(obj);
    callback(null,arr);
  });  
};

