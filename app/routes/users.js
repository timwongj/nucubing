var express = require('express');
var User = require('../schemas/user');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.route('/')
    .get(function(req, res) {
      // get all users
      User.find({}).exec(function(err, users) {
        if (err) {
          res.status(500).json({'message':'cannot get users'});
        } else {
          res.json(users);
        }
      });
    });

  router.route('/:facebook_id')
    .get(function(req, res) {
      // get user given facebook_id
      User.findOne({facebook_id:req.params.facebook_id}).exec(function(err, user) {
        if (err) {
          res.status(500).json({'message':'cannot get user for facebook_id: ' + req.params.facebook_id});
        } else {
          res.json(user);
        }
      });
    });

  return router;

})();
