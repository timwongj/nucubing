var express = require('express');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.get('/', function(req, res) {
    res.sendfile('./app/public/components/results/results.html');
  });

  return router;

})();
