var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');
var Scramble = require('../models/scramble');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // render results page
  router.get('/', function(req, res) {
    res.sendfile('./app/public/components/results/results.html');
  });

  // get all weeks
  router.get('/weeks', function(req, res) {
    Scramble.find({'week':{$lte:getCurrentWeek()}}).distinct('week', function(err, result) {
      res.json(result);
    });
  });

  // get all results given the week and event
  router.get('/week/:week/event/:event', function(req, res) {
    Result.find({'week':req.params.week, 'event':req.params.event, 'status':'Completed'}).exec(function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  // get all results given the week
  router.get('/week/:week', function(req, res) {
    Result.find({'week':req.params.week, 'status':'Completed'}).exec(function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  // get all results given the event
  router.get('/event/:event', function(req, res) {
    Result.find({'event':req.params.event, 'status':'Completed'}).exec(function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  // get all results
  router.get('/all', function(req, res) {
    Result.find({'status':'Completed'}).sort('-week').exec(function(err, result) {
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
