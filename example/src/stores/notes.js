var observable = require('../lib/observable');
var actions = require('../actions');

function NotesStore() {
  this._notes = [];

  observable(this);
  actions.addNote.listen(this.onAddNote);
};

NotesStore.prototype.notes = function() {
  return this._notes;
};

NotesStore.prototype.onAddNote = function(note) {
  this._notes.push(note);
};

module.exports = new NotesStore();
