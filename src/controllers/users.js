const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const renderRegister = (req, res) => {
  res.render("users/register");
};

const register = catchAsync(async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = await User.register(new User({ email, username }), password);
    req.login(user, (err) => {
      // Error Case
      if (err) return next(err);

      // Success Case
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

const renderLogin = (req, res) => {
  res.render("users/login");
};

const login = (req, res) => {
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  req.flash("success", "Welcome Back");
  res.redirect(redirectUrl);
};

const logout = (req, res, next) => {
  req.logout((err) => {
    // Error Case
    if (err) return next(err);

    // Success Case
    req.flash("success", "Logout Success!");
    res.redirect("/campgrounds");
  });
};

module.exports = { renderRegister, register, renderLogin, login, logout };
