exports.m = {};
exports.req = function(req, res, next) {
  res.locals.user = req.user || {};
  next();
};
exports.logged = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
};
