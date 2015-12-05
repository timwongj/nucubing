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
      console.log('Result Submission');
      console.log(req.user ? ('name: ' + req.user.displayName + ', facebook_id: ' + req.user.facebook_id) : 'no User');
      console.log(req.body ? ('week: ' + req.body.week + ', event: ' + req.body.event + ', status: ' + req.body.status + ', data: ' + req.body.data) : 'no body');
      if (req.user) {
        Result.remove({'week':req.body.week, 'event':req.body.event, 'email':req.body.email}).exec(function(err) {
          if (err) {
            res.status(500).json({'message':'cannot save result'});
          }
          var result = new Result({
            event: req.body.event,
            week: req.body.week,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            facebook_id: req.user.facebook_id,
            status: req.body.status,
            data: req.body.data
          });
          result.save(function(err) {
            if (err) {
              res.status(500).json({'message':'cannot save result'});
            } else {
              res.status(200).json({'message':'result was successfully saved'});
            }
          });
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
