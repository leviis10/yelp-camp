const Review = require("../models/Review");

async function isReviewAuthor(req, res, next) {
  const { campgroundId, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  // Success Case
  if (review.author.equals(req.user._id)) return next();

  // Error Case
  req.flash("error", "You do not have permission to do that");
  res.redirect(`/campgrounds/${campgroundId}`);
}

module.exports = isReviewAuthor;
