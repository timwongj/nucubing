'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var UserSchema = new mongoose.Schema({
  id:ObjectId,
  facebook_id:String,
  firstName: String,
  lastName: String,
  email:String,
  wcaID:String,
  provider:String
});

var User = mongoose.model('User', UserSchema);

module.exports = User;