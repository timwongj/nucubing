var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // set current week
  var currentWeek = '080915';

  // render results page
  router.get('/', function(req, res) {
    res.sendfile('./public/components/results/results.html');
  });

  // get all results given the week and event
  router.get('/results/current', function(req, res) {
    Result.find({'week':currentWeek}, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  return router;

})();
