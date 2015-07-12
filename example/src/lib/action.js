var observable = require('./observable');

exports.create = function() {
  var events = {};
  observable(events);

  function action() {
    events.trigger.apply(null, ['action'].concat(arguments));
  }
  action.listen = function(fn) {
    events.on('action', fn);
  };
  return action;
};
