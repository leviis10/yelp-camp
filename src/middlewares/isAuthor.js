const Campground = require("../models/Campground");

async function isAuthor(req, res, next) {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  // Success Case
  if (campground.author.equals(req.user._id)) return next();

  // Error Case
  req.flash("error", "You do not have permission to do that");
  res.redirect(`/campgrounds/${id}`);
}

module.exports = isAuthor;
