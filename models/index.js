var User = require('./user');
var Collection = require('./collection');
var Picture = require('./picture');

module.exports = {
  User: User.model,
  Collection: Collection.model,
  Picture: Picture.model
}