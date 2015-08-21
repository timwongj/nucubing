var express = require('express');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.get('/', function(req, res) {
    res.sendfile('./app/public/components/users/users.html');
  });

  router.get('/:id', function(req, res) {
    res.sendfile('./app/public/components/profile/profile.html');
  });

  return router;

})();
