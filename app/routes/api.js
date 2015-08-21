var express = require('express');
var fs = require('fs');
var User = require('../models/user');
var Result = require('../models/result');
var Scramble = require('../models/scramble');
var Event = require('../models/event');

module.exports = (function() {

  'use strict';

  var admins = ['timothywong8@gmail.com'];

  var router = express.Router();

  router.route('/user')
    .get(function(req, res) {
      // get login status
      if (req.user)
        res.json(req.user);
      else
        res.json({});
    });

  router.route('/weeks')
    .get(function(req, res) {
      // get all weeks up to now
      Scramble.find({'week':{$lte:getCurrentWeek()}}).distinct('week').exec(function(err, weeks) {
        if (err) {
          res.status(500).json({'message':'cannot get weeks'});
        } else {
          weeks.sort(function(a, b){return b-a;});
          res.json(weeks);
        }
      });
    });

  router.route('/events')
    .get(function(req, res) {
      // get all events
      Event.find({}, function(err, events) {
        if (err) {
          res.status(500).json({'message':'cannot get events'});
        } else {
          res.json(events);
        }
      });
    });

  router.route('/users')
    .get(function(req, res) {
      // get all users
      User.find({}, function(err, users) {
        if (err) {
          res.status(500).json({'message':'cannot get users'});
        } else {
          res.json(users);
        }
      });
    });

  router.route('/users/:facebook_id')
    .get(function(req, res) {
      // get user given facebook_id
      User.findOne({facebook_id:req.params.facebook_id}, function(err, user) {
        if (err) {
          res.status(500).json({'message':'cannot get user for facebook_id: ' + req.params.facebook_id});
        } else {
          res.json(user);
        }
      });
    });

  router.route('/results')
    .get(function(req, res) {
      // get all results
      Result.find(req.query, function(err, results) {
        if (err) {
          res.status(500).json({'message':'cannot get results'});
        } else {
          console.log(req.query);
          console.log(req.results);
          res.json(results);
        }
      });
    })
    .post(function(req, res) {
      // submit a result (logged in)
      console.log(req.body);
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
          throw err;
        }
      });
      result.save(function(err) {
        if (err) {
          res.status(500).json({'message':'cannot save result'});
        } else {
          res.status(200).json({'message':'result was successfully saved'});
        }
      });
    });

  router.route('/scrambles')
    .get(function(req, res) {
      // get all scrambles
      Scramble.find(req.query, function(err, scrambles) {
        if (err) {
          res.status(500).json({'message':'cannot get scrambles'});
        } else {
          res.json(scrambles);
        }
      });
    })
    .post(function(req, res) {
      // submit scrambles (admin)
      if (!(req.user && (admins.indexOf(req.user.email) >= 0))) {
        res.status(401).send('You are not authorized to view this page.');
      } else {
        try {
          var scrambles = JSON.parse(fs.readFileSync(req.files.file.path));
          var date = scrambles.competitionName.substr(scrambles.competitionName.length - 10, scrambles.competitionName.length);
          var week = date.substr(0, 2) + date.substr(3, 2) + date.substr(8, 2);
          for (var i = 0; i < scrambles.sheets.length; i++) {
            var scramble = new Scramble();
            scramble.event = scrambles.sheets[i].event;
            scramble.week = week;
            scramble.scrambles = scrambles.sheets[i].scrambles;
            scramble.extraScrambles = scrambles.sheets[i].extraScrambles;
            Scramble.remove({'week':week}, function(err) {
              if (err) {
                throw err;
              }
            });
            scramble.save(function(err) {
              if (err) {
                throw err;
              }
            });
          }
          res.send({status:'success'});
        } catch(e) {
          res.status(500).send({status:'failure', error:e});
        }
      }
    });

  router.route('/scrambles/:week')
    .get(function(req, res) {
      // get scrambles for given week
      Scramble.find({'week':req.params.week}, function(err, scrambles) {
        if (err) {
          res.status(500).json({'message':'cannot get scrambles for week: ' + req.params.week});
        } else {
          res.json(scrambles);
        }
      });
    })
    .put(function(req, res) {
      // edit scrambles for given week (admin)
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
