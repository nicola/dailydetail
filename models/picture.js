var db = require('../classes/store').MongoDB;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.model("Picture", new Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  stream: { type: Schema.ObjectId, ref: 'Stream' },
  title: String,
  description: String,
  picture: String,
  tags: String
}));

module.exports = {
  model: db.model("Picture")
};