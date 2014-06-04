var u = require('./util/util');

module.exports = _server;

function _server() {
  var express = require('express'),
    app = express(),
    fs = require('fs'),
    chokidar = require('chokidar'),
    path = require("path"),
    self = u.chain(u.eventEmitter({}));

  self.var("views", path.resolve("./views"), function(_) {
    self._vars.views = path.resolve(_);
  });
  self.var("public", path.resolve("./public"), function(_) {
    self._vars.public = path.resolve(_);
  });
  self.var("viewEngine", "jade");
  self.var("port", "80");

  self.applyConfiguration = function() {
    app.set('port', self.port())
    app.set('views', self.views());
    app.set('view engine', self.viewEngine());
    app.use(require("compression"));
    app.use('/public', express.static(self.public()));

    chokidar.watch(self.views(), { ignored:/^\./, persistent: true })
      .on("add", function(file) {
        var name = '/' + path.basename(file).replace(path.extname(file), '');
        app.get(name, function(req, res) {
          console.log(res);
        });
      });
  };

  self.start = function() {
    self.applyConfiguration();
    console.log(self.port());
    app.listen(self.port());
  };
  return self;
}
