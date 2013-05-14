var express = require("express");
var async = require("async");
var ejs = require("ejs");
var http = require('http');
var RedisStore = require("connect-redis")(express);
var fileupload = require('fileupload').createFileUpload(__dirname + '/uploads').middleware

var auth = require("./classes/auth");
var store = require('./classes/store').Redis;

var User = require('./models/user');
var Collection = require('./models/collection');
var Picture = require('./models/picture');
var db = require('./models/index');

var app = module.exports = express();

app.configure(function () {
  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");
  app.engine("html", ejs.renderFile);
  app.use(express.bodyParser());
  app.use(express.cookieParser("alskjald0q9udqokwdmqldiqud0woqijdklq09"));
  app.use(express.session({ store: new RedisStore({client: store}) }));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + "/static"));
  app.use(auth.initialize());
  app.use(auth.session());
  app.use(app.router);
});


app.get('/', function(req, res) {
  res.locals.user = req.user || {};
  res.render("index");
});

// Authentication
app.get("/login", function (req, res) { return res.render("login"); });
app.post('/login', auth.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/logout', function (req, res) { req.logout(); res.redirect('/'); });


// Routes and API
// Routes - Collection
app.get('/u/:userUsername/:collectionTitle', function(req, res) {
  res.render('collection');
});
app.get('/c/:collectionTitle', function(req, res) {
  res.render('collection');
});
// API - Collection
app.get('/api/v1/collection/:collectionId', function(req, res) {
  res.json(doc)
});
app.post('/api/v1/collection/:collectionId', fileupload, function(req, res) {
  res.json(doc)
});
app.put('/api/v1/collection/:collectionId', function(req, res) {
  res.json(doc)
});
app.del('/api/v1/collection/:collectionId', function(req, res) {
  res.json(doc)
});

// Routes - Picture
app.get('/u/:userUsername/:collectionTitle/:pictureId', function(req, res) {
  res.render('picture');
});
app.get('/c/:collectionTitle/:pictureId', function(req, res) {
  res.render('picture');
});
// API - Picture
app.get('/api/v1/picture/:pictureId', function(req, res) {
  res.json(doc)
});
app.put('/api/v1/picture/:pictureId', function(req, res) {
  res.json(doc)
});
app.del('/api/v1/picture/:pictureId', function(req, res) {
  res.json(doc)
});

// Routes - User
app.get('/u/:userUsername', function(req, res) {
  res.render('user');
});
// API - User
app.get('/api/v1/picture/:pictureId', function(req, res) {
  res.json(doc)
});
app.put('/api/v1/picture/:pictureId', function(req, res) {
  res.json(doc)
});
app.del('/api/v1/picture/:pictureId', function(req, res) {
  res.json(doc)
});

var port = process.env.PORT || 1200;
var server = http.createServer(app).listen(port, function () {
	console.log("Virginialonso server escucha sobre ", server.address().port, app.settings.env);
});

db.User.findOne({username: 'bing'}, function (err, doc) {
  if (!doc) {
    doc = new db.User({
      username: 'bing',
      password: 'pass'
    }).save(function (err, doc) {
      console.log('Creating test user test:pass', err);
    });
	}
});