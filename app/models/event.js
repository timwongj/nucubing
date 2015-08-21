var mongoose = require('mongoose');

module.exports = (function() {

  'use strict';

  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var EventSchema = new mongoose.Schema({
    id: ObjectId,
    event_id: String,
    name: String,
    format: String,
    displayed_format: String,
    index: Number
  });

  var Event = mongoose.model('Event', EventSchema);

  return Event;

})();