var express = require('express');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.route('/')
    .get(function(req, res) {
      // get login status
      if (req.user)
        res.json(req.user);
      else
        res.json({});
    });

  return router;

})();
