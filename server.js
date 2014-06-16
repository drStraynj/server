var u = require('./util/util');

module.exports = _server;

function _server() {
  var express = require('express'),
    app = express(),
    chokidar = require('chokidar'),
    path = require("path"),
    fs = require('fs'),
    self = u.chain(u.eventEmitter({}));

  self.var("port", "80")
  self.var("views", path.resolve("./views"), function(_) {
    self._vars.views = path.resolve(_);
  })
  self.var("public", path.resolve("./public"), function(_) {
    self._vars.public = path.resolve(_)
  })
  self.var('home', function(req, res) {
    res.send("UNDER CONSTRUCTION")
  })

  self.applyConfiguration = function() {
    app.set('port', self.port())
    app.set('views', self.views())
    app.engine('.jade', require('jade').__express)
    app.use('/public', express.static(self.public()))
    app.get('/', self.home())

    chokidar.watch(self.views(), { ignored:/^\./, persistent: true })
      .on("add", function(file) {
          var name = getName(file);
          if (name == "/home") name = '/';
          app.get(name, function(req, res) { res.render(file) })
        })
  }
  self.start = function() {
    self.applyConfiguration();
    app.listen(self.port());
  }
  return self;
  function getName(file) {
    return '/' + path.basename(file).replace(path.extname(file), '');
  }
}
