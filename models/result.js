var mongoose = require('mongoose');

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
  data:String
});

var Result = mongoose.model('Result', ResultSchema);

module.exports = Result;