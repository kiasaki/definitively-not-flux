var React = require('react');

var Layout = React.createClass({
  render: function() {
    return (
      <div className="app">
        <header className="app__header">
          <h1 className="header__logo">N</h1>
        </header>

        <aside className="app__sidebar">
          <nav>
            <a href="#">All notes</a>
            <a href="#/new">New note</a>
          </nav>
        </aside>

        <section className="app__content">
          {this.children}
        </section>
      </div>
    );
  }
});

module.exports = Layout;
