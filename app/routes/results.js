var express = require('express');
var Result = require('../schemas/result');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.route('/')
    .get(function(req, res) {
      Result.find(req.query).sort('-week').exec(function(err, results) {
        if (err) {
          res.status(500).json({'message':'cannot get results'});
        } else {
          res.json(results);
        }
      });
    })
    .post(function(req, res) {
      if (req.user) {
        var result = new Result();
        result.event = req.body.event;
        result.week = req.body.week;
        result.email = req.user.email;
        result.firstName = req.user.firstName;
        result.lastName = req.user.lastName;
        result.facebook_id = req.user.facebook_id;
        result.status = req.body.status;
        result.data = req.body.data;
        Result.remove({'week':result.week, 'event':result.event, 'email':result.email}).exec(function(err, result) {
          if (err) {
            res.status(500).json({'message':'cannot save result'});
          }
        });
        result.save(function(err) {
          if (err) {
            res.status(500).json({'message':'cannot save result'});
          } else {
            res.status(200).json({'message':'result was successfully saved'});
          }
        });
      } else {
        res.status(500).json({'message':'login is required to submit a result'});
      }
    })
    .put(function(req, res) {
      if (req.user.email === 'timothywong8@gmail.com') {
        Result.update(req.query, req.body, function(err, result) {
          if (err) {
            res.status(500).json({'message':'cannot update result'});
          } else {
            res.status(200).json({'message':'result was successfully updated'});
          }
        });
      } else {
        res.status(401).json({'message':'Unauthorized'});
      }
    })
    .delete(function(req, res) {
      if (req.user.email === 'timothywong8@gmail.com') {
        Result.remove(req.query, function(err, removed) {
          if (err) {
            res.status(500).json({'message':'cannot remove result'});
          } else {
            console.log(removed);
            res.status(200).json({'message':'result was sucessfully removed'});
          }
        });
      } else {
        res.status(401).json({'message':'Unauthorized'});
      }
    });

  return router;

})();
