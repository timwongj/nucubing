var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // set current week
  var currentWeek = '080915';

  var eventMap = {
    'x3Cube' : {fileName : '3x3x3 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x4Cube' : {fileName: '4x4x4 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x5Cube' : {fileName: '5x5x5 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x2Cube' : {fileName: '2x2x2 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x3BLD' : {fileName: '3x3x3 Blindfolded Round 1.txt', scrambles : 3, extras : 2},
    'x3OH' : {fileName: '3x3x3 One-Handed Round 1.txt', scrambles : 5, extras : 2},
    'x3FMC' : {fileName: '3x3x3 Fewest Moves Round 1.txt', scrambles : 3, extras : 0},
    'x3FT' : {fileName: '3x3x3 With Feet Round 1.txt', scrambles : 3, extras : 2},
    'mega' : {fileName: 'Megaminx Round 1.txt', scrambles : 5, extras : 2},
    'pyra' : {fileName: 'Pyraminx Round 1.txt', scrambles : 5, extras : 2},
    'sq1' : {fileName: 'Square-1 Round 1.txt', scrambles : 5, extras : 2},
    'clock' : {fileName: 'Rubik\'s Clock Round 1.txt', scrambles : 5, extras : 2},
    'skewb' : {fileName: 'Skewb Round 1.txt', scrambles : 5, extras : 2},
    'x6Cube' : {fileName: '6x6x6 Cube Round 1.txt', scrambles : 3, extras : 2},
    'x7Cube' : {fileName: '7x7x7 Cube Round 1.txt', scrambles : 3, extras : 2},
    'x4BLD' : {fileName: '4x4x4 Cube Blindfolded Round 1.txt', scrambles : 3, extras : 2},
    'x5BLD' : {fileName: '5x5x5 Cube Blindfolded Round 1.txt', scrambles : 3, extras : 2},
    'x3MBLD' : {fileName: '3x3x3 Multiple Blindfolded Round 1.txt', scrambles : 35, extras : 0}
  };

  // render contest page
  router.get('/', function(req, res) {
    if (req.user)
      res.sendfile('./public/components/contest/contest.html');
    else
      res.sendfile('./public/components/login/login.html');
  });

  // get user's contest results for current week
  router.get('/results/current', function(req, res) {
    User.findOne({'facebook_id':req.user.facebook_id}, function(err, user) {
      if (err) {
        throw err;
      } else if (user) {
        Result.find({'week':currentWeek, 'email':user.email}, function(err, result) {
          if (err) {
            throw err;
          } else {
            res.json(result);
          }
        });
      }
    });
  });

  // get scrambles given the event
  router.get('/scrambles/:event', function(req, res) {
    var filename = eventMap[req.params['event']].fileName;
    var weekPath = 'NU_CUBING_' + currentWeek.substr(0, 2) + '-' + currentWeek.substr(2, 2) + '-20' + currentWeek.substr(4, 2);
    var file = fs.readFileSync('./scrambles/' + weekPath + '/txt/' + filename, 'utf-8');
    var scrambles = file.split('\n');
    scrambles.splice(scrambles.length - eventMap[req.params.event].extras, eventMap[req.params.event].extras);
    res.json(scrambles);
  });

  // get results for the event for the current week if they exist
  router.get('/results/:event', function(req, res) {
    Result.findOne({'week':currentWeek, 'event':req.params.event, 'email':req.user.email}, function(err, result) {
      if (err) {
        throw err;
      } else if (result) {
        res.json(result);
      }
    });
  });

  // submit results for the given week and event
  router.post('/submit', function(req, res) {
    var result = new Result();
    result.week = currentWeek;
    result.event = req.body.event;
    result.email = req.user.email;
    result.firstName = req.user.firstName;
    result.lastName = req.user.lastName;
    result.facebook_id = req.user.facebook_id;
    result.data = req.body.data;
    Result.remove({'week':result.week, 'event':result.event, 'email':result.email}, function(err, result) {
      if (err) {
        throw err;
      }
    });
    result.save(function(err) {
      if (err) {
        throw err;
      }
    });
    res.json(result);
  });

  return router;

})();
