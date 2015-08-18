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

  // send user info such as name, email, and facebook id
  router.get('/userInfo', function(req, res) {
    User.findOne({'facebook_id': req.user.facebook_id}).exec(function(err, user) {
      if (err) {
        throw err;
      } else {
        res.json(user);
      }
    });
  });

  // send user info such as name, email, and facebook id given facebook_id
  router.get('/userInfo/:facebook_id', function(req, res) {
    User.findOne({'facebook_id': req.params.facebook_id}).exec(function(err, user) {
      if (err) {
        throw err;
      } else {
        res.json(user);
      }
    });
  });

  // get contest results for all weeks for current user
  router.get('/results/all', function(req, res) {
    User.findOne({'facebook_id': req.user.facebook_id}).exec(function(err, user) {
      if (err) {
        throw err;
      } else if (user) {
        Result.find({'email':user.email, 'status':'Completed'}).sort('-week').exec(function(err, result) {
          if (err) {
            throw err;
          } else {
            res.json(result);
          }
        });
      }
    });
  });

  // get contest results for all weeks given facebook_id
  router.get('/results/all/:facebook_id', function(req, res) {
    User.findOne({'facebook_id': req.params.facebook_id}).exec(function(err, user) {
      if (err) {
        throw err;
      } else if (user) {
        Result.find({'email':user.email, 'status':'Completed'}).sort('-week').exec(function(err, result) {
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
