var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // render results page
  router.get('/', function(req, res) {
    res.sendfile('./public/components/results/results.html');
  });

  // get all results given the week and event
  router.get('/results/current', function(req, res) {
    Result.find({'week':getCurrentWeek(), 'status':'Completed'}, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  function getCurrentWeek() {
    var today = new Date();
    var sunday = new Date();
    sunday.setDate(today.getDate() - today.getDay());
    var date = (sunday.getDate() < 10) ? '0' + sunday.getDate().toString() : sunday.getDate().toString();
    var month = (sunday.getMonth() < 10) ? '0' + (sunday.getMonth() + 1).toString() : (sunday.getMonth() + 1).toString();
    var year = sunday.getFullYear().toString().substr(2, 2);
    return month + date + year;
  }

  return router;

})();
