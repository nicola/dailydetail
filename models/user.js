var db = require('../classes/store').MongoDB;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.model("User", new Schema({
  username: String,
  password: String,
  email: String,
  streams: [{ type: Schema.ObjectId, ref: 'Stream' }]
}));
module.exports = {
  model: db.model("User")
};