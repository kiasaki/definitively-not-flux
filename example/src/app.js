var React = require('react');
var router = require('./router');

var Notes = require('./components/notes.jsx');

router.route(function(section) {if (!section) {
  React.render(<Notes />, document.getElementById('app'));
}});

router.start();
router.route(window.location.hash);
