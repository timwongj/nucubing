var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.use(function(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/auth');
    }
  });

  // render profile page
  router.get('/', function(req, res) {
    res.sendfile('./public/components/profile/profile.html');
  });

  // send user info such as name, email, and facebook id
  router.get('/userInfo/:id', function(req, res) {
    var facebook_id = (req.params.id == 'myProfile') ? req.user.facebook_id : req.params.id;
    User.findOne({'facebook_id': facebook_id}, function(err, user) {
      if (err) {
        throw err;
      } else {
        res.json(user);
      }
    });
  });

  // get contest results for all weeks given user id
  router.get('/results/all/:id', function(req, res) {
    var facebook_id = (req.params.id == 'myProfile') ? req.user.facebook_id : req.params.id;
    User.findOne({'facebook_id': facebook_id}, function(err, user) {
      if (err) {
        throw err;
      } else if (user) {
        Result.find({'email':user.email, 'status':'Completed'}, function(err, result) {
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
