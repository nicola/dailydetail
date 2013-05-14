var redis = require('redis');
var mongoose = require('mongoose');
var store;
if (process.env.REDISTOGO_URL) {
	var rtg = require("url").parse(process.env.REDISTOGO_URL);
	store = redis.createClient(rtg.port, rtg.hostname);
	store.auth(rtg.auth.split(":")[1]);
} else {
	store = redis.createClient();
}
exports.Redis = store;
exports.MongoDB = mongoose.connect(process.env.MONGOHQ_URL || "mongodb://heroku:master@alex.mongohq.com:10039/app9239381");
