var db = require('../classes/store').MongoDB;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.model("Stream", new Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  title: String,
  description: String,
  tags: [String],
  url: String,
  pictures: [{ type: Schema.ObjectId, ref: 'Picture' }]
}));

module.exports = {
  model: db.model("Stream")
};