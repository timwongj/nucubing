var express = require('express');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // render profile page
  router.get('/', function(req, res) {
    if (req.user) {
      res.sendfile('./app/public/components/profile/profile.html');
    } else {
      res.redirect('/auth');
    }
  });

  return router;

})();
