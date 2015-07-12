var observable = require('./observable');

function parser(path) {
  return path.split('/');
}

function Router() {
  this.started = false;
  this.current = null;
  observable(this);
}

Router.prototype.route = function(arg) {
  if (typeof arg === 'string') { // string
    window.location.hash = arg;
    this.emit(arg);
  } else { // function
    this.on('H', arg);
  } 
};

Router.prototype.emit = function(path) {
  if (path.type) path = window.location.href.split('#')[1] || '';
  if (path != this.current) {
    this.trigger.apply(null, ['H'].concat(parser(path)));
    this.current = path;
  }
};

Router.prototype.start = function() {
  if (this.started) return;
  if (window.addEventListener) {
    window.addEventListener('hashchange', this.emit.bind(this), false);
  } else {
    window.attachEvent('onhashchange', this.emit.bind(this));
  }
  this.started = true;
};

module.exports = Router;
