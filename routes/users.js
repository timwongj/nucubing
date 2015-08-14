var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // render results page
  router.get('/', function(req, res) {
    res.sendfile('./public/components/users/users.html');
  });

  router.get('/:id', function(req, res) {
    res.sendfile('./public/components/profile/profile.html');
  });

  router.get('/users/all', function(req, res) {
    User.find({}, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    })
  });

  return router;

})();
