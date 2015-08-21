var express = require('express');
var Scramble = require('../models/scramble');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.route('/')
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
