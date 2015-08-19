var express = require('express');
var fs = require('fs');
var Scramble = require('../models/scramble');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  var admins = ['timothywong8@gmail.com'];

  router.use(function(req, res, next) {
    if (!(req.user && (admins.indexOf(req.user.email) >= 0))) {
      res.status(401).send('You are not authorized to view this page.');
    } else {
      next();
    }
  });

  router.get('/', function(req, res) {
    res.sendfile('./app/public/components/admin/admin.html');
  });

  router.get('/scrambles', function(req, res) {
    Scramble.find({}).exec(function(err, result) {
      if (err) {
        throw err;
      } else {
        res.json(result);
      }
    });
  });

  router.post('/scrambles', function(req, res) {
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
  });

  return router;

})();
