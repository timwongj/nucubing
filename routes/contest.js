var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');
var Scramble = require('../models/scramble');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.use(function(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/login');
    }
  });

  // render contest page
  router.get('/', function(req, res) {
      res.sendfile('./public/components/contest/contest.html');
  });

  router.get('/:event/entry', function(req, res) {
    res.sendfile('./public/components/contestEntry/contestEntry.html');
  });

  router.get('/:event/timer', function(req, res) {
    res.sendfile('./public/components/contestTimer/contestTimer.html');
  });

  router.get('/333fm', function(req, res) {
    res.sendfile('./public/components/contestFmc/contestFmc.html');
  });

  router.get('/333mbf', function(req, res) {
    res.sendfile('./public/components/contestMbld/contestMbld.html');
  });

  // get user's contest results for current week
  router.get('/results/current', function(req, res) {
    User.findOne({'facebook_id':req.user.facebook_id}, function(err, user) {
      if (err) {
        throw err;
      } else if (user) {
        Result.find({'week':getCurrentWeek(), 'email':user.email}, function(err, result) {
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
    Scramble.find({week:getCurrentWeek(), event:req.params.event}, function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  // get results for the event for the current week if they exist
  router.get('/results/:event', function(req, res) {
    Result.findOne({'week':getCurrentWeek(), 'event':req.params.event, 'email':req.user.email}, function(err, result) {
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
    result.week = getCurrentWeek();
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
