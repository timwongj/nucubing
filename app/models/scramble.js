'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectId = Schema.ObjectId;

var ScrambleSchema = new mongoose.Schema({
  id:ObjectId,
  event:String,
  week:String,
  scrambles:[String],
  extraScrambles:[String]
});

var Result = mongoose.model('Scramble', ScrambleSchema);

module.exports = Result;