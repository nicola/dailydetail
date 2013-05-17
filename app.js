var express = require("express");
var Q = require("q");
var qm = require("qmongo");
var __ = require("underscore");
var async = require("async");
var ejs = require("ejs");
var http = require('http');
var RedisStore = require("connect-redis")(express);
var mongoose = require('mongoose');
var util = require('util');
var passport = require("./classes/passport");
var auth = require("./classes/auth");
var store = require('./classes/store').Redis;

var User = require('./models/user');
var Stream = require('./models/collection');
var Picture = require('./models/picture');
var db = require('./models/index');

var app = module.exports = express();

function page(id) {
  return function(req, res, next) {
    res.locals.bodyClass = id;
    next();
  }
}

app.locals.linkStream = function(stream, classes) {
  classes = classes ?  'class="'+classes+'"' : "";
  return '<a href="/stream/'+stream.url+'" '+classes+'>'+stream.title+'</a>';
};
app.locals.linkUser = function(user, classes) {
  classes = classes ?  'class="'+classes+'"' : "";
  return '<a href="/user/'+user.username+'" '+classes+'>'+user.username+'</a>';
};

ejs.filters.sayHi = function(name) {
  return 'Hello ' + name;
};

function uploadFile(req, res, next) {
  if (req.files) {
    req.body.url = "/" + req.files.file.path.split("/").slice(-2).join("/")
    req.body.path = req.files.file.path.split("/").slice(-2).join("/")
  }
  next()
}

app.configure(function () {
  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");
  app.engine("html", ejs.renderFile);
  app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + "/static/uploads" }));
  app.use(express.cookieParser("alskjald0q9udqokwdmqldiqud0woqijdklq09"));
  app.use(express.session({ store: new RedisStore({client: store}) }));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + "/static"));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});


app.get('/', page("index"), auth.req, auth.logged, function(req, res) {
  Stream.model.find({}).limit(5).populate('user').populate({path: 'pictures', options: { limit: 5 }}).exec()
    .then(function(streams) {
      res.locals.page = req.user;
      res.locals.streams = streams;
      res.render("index");
    })
    .end();
});

app.get('/streams', page("user"), auth.req, auth.logged, function(req, res) {
  Stream.model.find({user: req.user._id}).populate({path: 'pictures', options: { limit: 5 }}).exec()
    .then(function(streams){
      res.locals.page = req.user;
      res.locals.streams = streams || [];
      res.render('streams');
    })
    .end();
});

app.get('/user/:userUsername', page("user"),  auth.req, function(req, res) {
  User.model.findOne({username: req.params.userUsername}).exec()
    .then(function(user) {
      if (!user) return res.redirect("/404");
      res.locals.page = user;
      return Stream.model.find({user: user._id}).populate({path: 'pictures', options: { limit: 5 }}).exec();
    }).
    then(function(streams) {
      res.locals.streams = streams || [];
      res.render('streams');
    })
    .end();
});

app.get('/stream/:streamUrl', page('streampg'), auth.req, function(req, res) {
  Stream.model.findOne({url:req.params.streamUrl}).populate('user').populate({path: 'pictures', options: { limit: 5 }}).exec()
    .then(function(stream) {
      if (!stream) return res.redirect('404');
      var stream1 = stream.toObject();
      res.locals.stream = stream;
      res.locals.page = stream.user;
      res.render('stream');
    });
});

// Authentication
app.get("/404", page('login'), function(req, res) { return res.render("404"); });
app.get("/login", page("login"), function (req, res) {
  return res.render("login");
});
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/logout', function (req, res) { req.logout(); res.redirect('/'); });


// Routes and API

app.post('/api/v1/stream', auth.req, auth.logged, function(req, res) {
  var newStream = new Stream.model({user: req.user._id, title: req.body.title, description: req.body.description, url: req.body.url});
  Q.when(
    qm.save(newStream),
    qm.exec(User.model.update(req.user._id, { $addToSet: { streams: newStream } }))
  ).then(function(args) {
    res.json(args);
  }).done();
});

app.del('/api/v1/stream/:streamId', function(req, res) {
  Q.when(
    qm.exec(User.model.update(req.user._id, { $pull: {streams: req.params.streamId } })),
    qm.exec(Stream.model.remove({_id: req.params.streamId})),
    qm.exec(Picture.model.remove({stream: req.params.streamId}))
  ).then(function(args) {
    console.log(args);
    res.json(args[0]);
  }).done();
});

app.put('/api/v1/stream/:streamId', function(req, res) {
  Q.when(
    qm.exec(Stream.model.update(req.params.streamId, {url: req.body.url, title: req.body.title, description: req.body.description}))
  ).then(function(args){
    console.log(args);
    res.json(args[0]);
  });
});

app.post('/api/v1/stream/:streamId', function(req, res) {
  Stream.model.findById(req.params.streamId).exec(function(err, stream) {
    console.log("upload into", stream);
    if (err || !stream) return res.json(500, {message:"Nothing found"});
    var newPic = new Picture.model({
      user: req.user._id,
      title: req.body.title,
      size: req.files.upload.size,
      type: req.files.upload.type,
      path: req.files.upload.path.replace(__dirname+"/static", ''),
      stream:req.params.streamId
    });
    stream.pictures.addToSet(newPic);
    Q.when(
      qm.save(newPic),
      qm.save(stream)
    ).then(function(args) {
        console.log(args);
      res.json(args);
    }, console.log)
  });
});



// API - Collection
app.get('/api/v1/stream/:streamId', function(req, res) {
  res.json(doc)
});
// Routes - Picture
app.get('/u/:userUsername/:streamTitle/:pictureId', function(req, res) {
  res.render('picture');
});
app.get('/c/:streamTitle/:pictureId', function(req, res) {
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

var port = process.env.PORT || 1200;
var server = http.createServer(app).listen(port, function () {
	console.log("Virginialonso server escucha sobre ", server.address().port, app.settings.env);
});

User.model.findOne({username: 'bing'}, function (err, first_user) {
  if (first_user) {
    return;
  }

  first_user = new User.model({ username: 'bing', password: 'pass' });
  var first_stream = new Stream.model({
    user: first_user,
    title: "test1",
    url: "test1",
    description: "test"
  });
  first_user.streams.push(first_stream);
  first_user.save();
  first_stream.save();

});
