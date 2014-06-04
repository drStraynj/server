module.exports = {
  chain: _chain,
  eventEmitter: _eventEmitter
}

function _chain(self) {
  self._name = "chain";
  self.__chain__ = true;
  self._vars = {};
  self.var = function(name, def, cb) {
    self._vars[name] = def;
    self[name] = function(_) {
      if (!arguments.length) return self._vars[name];
      var old = self._vars[name];
      self._vars[name] = _;
      cb && cb.call(self, _, old);
      return self;
    }
  }
  self.function = function(name, fn) {
    self[name] = function() {
      fn && fn.apply(self, arguments);
      return self;
    }
  }
  self.vars = function() {
    for (var i = 0; i < arguments.length; i++) { self.var(arguments[i]); }
  }
  self.call = function(fn) {
    var args = utils.args(arguments);
    args[0] = self;
    fn && fn.apply(self, args);
    return self;
  }
  return self;
}

function _eventEmitter(self) {
  self.__eventEmitter__ = true;
  self._events = {};
  self._regexes = {};
  self._alerts = {};
  self.on = function(event, listener) {
    var type = event instanceof RegExp ? "_regexes" : "_events";
    if (!listener) {
      if (event in self[type]) return self[type][event];
      for (var i in self._regexes) {
        if (event.match(RegExp(i.replace(/\//g,'')))) return self._regexes[i];
      }
    }
    if (!self[type][event]) self[type][event] = [];
    if (listener) self[type][event].push(listener);
    return self;
  }
  self.onAlert = function(alert, listener) {
    if (!listener) return self._alerts[alert];
    if (!self._alerts[alert]) self._alerts[alert] = [];
    listener && self._alerts[alert].push(listener);
    return self;
  }
  self.alert = function(event) {
    var args = arg_array(arguments, 1);
    if (event in self._alerts)
      self._alerts[event].forEach(function(cb) { cb.apply(self, args); });
    return self;
  }
  self.emit = function(event) {
    var args = arg_array(arguments, 1);
    for (var i in self._regexes) {
      if (event.match(RegExp(i.replace(/\//g,''))))
        self._regexes[i].forEach(function(cb) { cb.apply(self, args); });
    }
    if (event in self._events)
      self._events[event].forEach(function(cb) { cb.apply(self, args); });
    return self;
  }
  return self;
}
