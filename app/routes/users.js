var express = require('express');
var User = require('../models/user');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // render results page
  router.get('/', function(req, res) {
    res.sendfile('./app/public/components/users/users.html');
  });

  router.get('/:id', function(req, res) {
    res.sendfile('./app/public/components/profile/profile.html');
  });

  return router;

})();
