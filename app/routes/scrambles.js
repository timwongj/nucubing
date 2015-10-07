var express = require('express');
var fs = require('fs');
var Scramble = require('../schemas/scramble');

module.exports = (function() {

  'use strict';

  var admins = ['timothywong8@gmail.com'];

  var router = express.Router();

  router.route('/')
    .get(function(req, res) {
      // get all scrambles
      Scramble.find(req.query).exec(function(err, scrambles) {
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

  router.route('/:week')
    .get(function(req, res) {
      // get scrambles for given week
      Scramble.find({'week':req.params.week}, function(err, scrambles) {
        if (err) {
          res.status(500).json({'message':'cannot get scrambles for week: ' + req.params.week});
        } else {
          res.json(scrambles);
        }
      });
    });

  return router;

})();
