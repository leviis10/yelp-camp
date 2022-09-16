function isLoggedIn(req, res, next) {
  // Success Case
  if (req.isAuthenticated()) return next();

  // Error Case
  req.flash("error", "Login First!");
  res.redirect("/login");
}

module.exports = isLoggedIn;
