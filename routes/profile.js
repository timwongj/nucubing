var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var Result = require('../models/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // set current week
  var currentWeek = '080915';

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

  return router;

})();
