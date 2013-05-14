var db = require('../classes/store').MongoDB;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.model("Picture", new Schema({
  title: String,
  description: String,
  tags: String
}));

module.exports = {
  model: db.model("Picture")
}