var mongoose = require('mongoose');

module.exports = (function() {

  'use strict';

  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var ScrambleSchema = new mongoose.Schema({
    id: ObjectId,
    event: String,
    week: String,
    scrambles: [String],
    extraScrambles: [String],
    dateUploaded: {
      type: Date,
      default: Date.now
    }
  });

  var Scramble = mongoose.model('Scramble', ScrambleSchema);

  return Scramble;

})();
