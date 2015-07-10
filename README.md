# Definitively not flux

This README is a demonstration of how you don't really need to implement a Flux
architecture (ok, it look a bit more like [Reflux](https://github.com/spoike/refluxjs))
into your React.js project.

## Events

The first things needed is some way of _listening_ and _emiting_ events as thats
exactly what our actions, stores and router will be doing left and right.

`observable.js (60 lines)`

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

## Actions

```js

```

## Example app

`actions.js`

```js
var action = require('./action');

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
