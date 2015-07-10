# Definitively not flux

This README is a demonstration of how you don't really need to implement a Flux
architecture (ok, it look a bit more like [Reflux](https://github.com/spoike/refluxjs))
into your React.js project.

## Events

The first things needed is some way of _listening_ and _emiting_ events as thats
exactly what our actions, stores and router will be doing left and right.

`lib/observable.js (60 lines)`

```js
function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

module.exports = function(subject) {
  var nextId = 1;
  var callbacks = {};

  subject.on = function(events, fn) {
    if (isFunction(fn)) {
      fn._id = (typeof fn._id == 'undefined') ? nextId++ : fn._id;

      events.replace(/\S+/g, function(name, pos) {
        callbacks[name] = callbacks[name] || [];
        callbacks[name].push(fn);
      });
    }
    return subject;
  };

  subject.off = function(events, fn) {
    if (events == '*') {
      callbacks = {};
    } else {
      events.replace(/\S+/g, function(name) {
        if (!callbacks[name]) return;
        if (fn) {
          callbacks[name] = callbacks[name].filter(function(cb) {
            return cb._id != fn._id;
          });
        } else {
          callbacks[name] = [];
        }
      });
    }
    return subject;
  }

  subject.one = function(event, fn) {
    function on() {
      subject.off(event, on);
      fn.apply(subject, arguments);
    }
    return subject.on(event, on);
  };

  subject.trigger = function(event) {
    var args = [].slice.call(arguments, 1);
    var fns = callbacks[event] || [];

    for (var i in fns) {
      var fn = fns[i];
      if (!fn.busy) {
        fn.busy = 1;
        fn.apply(subject, [event].concat(args));
        fn.busy = 0;
      }
    }
    return subject;
  };
};
```

## Action

Actions is the way your views can trigger data fetching or, more generally, make
stores do some work, ultimately triggering "change" events flowing back to views.

`lib/action.js (14 lines)`

```js
var observable = require('./observable');

module.exports = function() {
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
```

## Router

The missing piece to make a complete app is a router. Most apps have more that
one page right?

`lib/router.js (39 lines)`

```js
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
  if (arg[0]) { // string
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
    win.addEventListener('hashchange', this.emit, false);
  } else {
    win.attachEvent('onhashchange', this.emit);
  }
  this.started = true;
};

module.exports = Router;
```

## Example app

`actions.js`

```js
var action = require('./lib/action');

module.exports = {
  addTodo: action.create();
};
```

`stores/todo.js`

```js
var observable = require('../lib/observable');
var actions = require('../actions');

function TodoStore() {
  this.todos = [];

  observable(this);
  actions.addTodo.listen(this.onAddTodo);
};

TodoStore.prototype.todos = function() {
  return this.todos;
};

TodoStore.prototype.onAddTodo = function(todo) {
  this.todos.push(todo);
};

module.exports = new TodoStore();
```

`components/todo.js`

```js
var actions = require('../actions');
var todoStore = require('../stores/todo');

var Todo = React.createClass({
  getInitialState: function() {
    return {text: '', todos: todoStore.todos()};
  },
  componentWillMount: function() {
    store.on('change', this.onChange);
  },
  componentWillUnmount: function() {
    store.off('change', this.onChange);
  },
  onChange: function() {
    this.setState({todos: todoStore.todos()});
  },
  handleTextChange: function(event) {
    this.setState({text: event.target.value});
  },
  handleSubmit: function(event) {
    event.preventDefault();
    actions.addTodo({label: this.state.text});
    this.setState({text: ''});
  },
  render: function() {
    return (
      <div>
        <ul>{
          this.state.todos.map(function(todo, i) {
            return <TodoEntry key={i} todo={todo} />;
          })
        }</ul>
        <form onSubmit={this.handleSubmit}>
          <input type="text" onchange={this.handleTextChange} />
          <input type="submit" value="Add" />
        </form>
      </div>
    );
  }
});

React.renderComponent(<Todo />, document.querySelector('#app'));
```

## Credits

Heavy inspiration comes from [Riot.js](https://muut.com/riotjs/api/) as for
the observable and router files.
