/*
* service.js: Defines the web service for the WebSCADA module
*
* (C) 2012 LiNK d.o.o.
*
*/

var journey = require('journey'),
    helpers = require('./helpers'),
    swig = require('swig'),
    db = require('./db');

/**
* Creates the RESTful router for the WebSCADA web service
*/
exports.createRouter = function () {
  var router = new (journey.Router)({
    strict: false,
    strictUrls: false,
    api: 'basic',
    filter: helpers.auth.basicAuth
  });
  
  var html_header = {
    'Content-Type': 'text/html'
  };
  var plain_header = {
    'Content-Type': 'text/plain'
  };
  
  var resources_dir = __dirname+'/../resources/';
  var tmpl_artikli = swig.compileFile(resources_dir + 'artikli.html');
  
  router.path(/\/artikli/, function () {
    //
    // Authentication: Add a filter() method to perform HTTP Basic Auth
    //
    this.filter(function () {
      //
      // LIST: GET to /artikli/vsi
      //
      this.get(/\/vsi/).bind(function (res) {
        sql=resources_dir+'artikli_vsi.sql';
        db.select(sql,function(err,list){
          var html = tmpl_artikli.render({
            pagename: 'Vsi artikli',
            data: list
          });
          res.send(200, html_header, html);
        });
      });

      //
      // LIST: GET to /artikli/zaloga
      //
      this.get(/\/zaloga/).bind(function (res) {
        sql=resources_dir+'artikli_zaloga.sql';
        db.select(sql,function(err,list){
          var html = tmpl_artikli.render({
            pagename: 'Zaloga',
            data: list
          });
          res.send(200, html_header, html);
        });
      });

      //
      // LIST: GET to /artikli/odprodano
      //
      this.get(/\/odprodano/).bind(function (res) {
        sql=resources_dir+'artikli_odprodano.sql';
        db.select(sql,function(err,list){
          var html = tmpl_artikli.render({
            pagename: 'Odprodano',
            data: list
          });
          res.send(200, html_header, html);
        });
      });
    });
  });
  
  return router;
};