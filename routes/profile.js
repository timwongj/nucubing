var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // render profile page
  router.get('/', function(req, res) {
    if (req.user) {
      res.redirect('/profile/' + req.user.facebook_id);
    } else {
      res.sendfile('./public/components/login/login.html');
    }
  });

  // render profile page
  router.get('/:id', function(req, res) {
    res.sendfile('./public/components/profile/profile.html');
  });

  // send user info such as name, email, and facebook id
  router.get('/userInfo/:id', function(req, res) {
    User.findOne({'facebook_id':req.params['id']}, function(err, user) {
      if (err) {
        throw err;
      } else {
        res.json(user);
      }
    });
  });

  // get contest results for current week given user id
  router.get('/results/current/:id', function(req, res) {
    User.findOne({'facebook_id':req.params['id']}, function(err, user) {
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

  // get contest results for all weeks given user id
  router.get('/results/all/:id', function(req, res) {
    User.findOne({'facebook_id':req.params['id']}, function(err, user) {
      if (err) {
        throw err;
      } else if (user) {
        Result.find({'email':user.email}, function(err, result) {
          if (err) {
            throw err;
          } else {
            res.json(result);
          }
        });
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
