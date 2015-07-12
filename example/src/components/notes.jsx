var React = require('react');

var actions = require('../actions');
var router = require('../router');

var notesStore = require('../stores/notes');

var Notes = React.createClass({
  getInitialState: function() {
    return {notes: notesStore.notes()};
  },
  componentWillMount: function() {
    notesStore.on('change', this.onChange);
  },
  componentWillUnmount: function() {
    notesStore.off('change', this.onChange);
  },
  onChange: function() {
    this.setState({notes: notesStore.notes()});
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
        <h1>Notes</h1>
        <ul>{
          this.state.notes.map(function(todo, i) {
            return <TodoEntry key={i} todo={todo} />;
          })
        }</ul>
      </div>
    );
  }
});

module.exports = Notes;
