var db = require('../classes/store').MongoDB;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.model("Collection", new Schema({
  title: String,
  description: String,
  tags: String,
  url: String
}));

module.exports = {
  model: db.model("Collection")
}