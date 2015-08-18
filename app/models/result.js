var mongoose = require('mongoose');

module.exports = (function() {

  'use strict';

  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ResultSchema = new mongoose.Schema({
    id:ObjectId,
    facebook_id:String,
    firstName: String,
    lastName: String,
    email:String,
    week:String,
    event:String,
    status:String,
    data:String
  });

  var Result = mongoose.model('Result', ResultSchema);

  return Result;

})();