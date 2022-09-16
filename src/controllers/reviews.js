const Campground = require("../models/Campground");
const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");

const createReview = catchAsync(async (req, res) => {
  const { campgroundId } = req.params;

  const review = new Review({ ...req.body.review, author: req.user._id });
  await Campground.findByIdAndUpdate(campgroundId, {
    $push: { reviews: review.id },
  });
  await review.save();

  req.flash("success", "Your Review has been created!");
  res.redirect(`/campgrounds/${campgroundId}`);
});

const deleteReview = catchAsync(async (req, res) => {
  const { campgroundId, reviewId } = req.params;

  await Campground.findByIdAndUpdate(campgroundId, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted Successfully!");
  res.redirect(`/campgrounds/${campgroundId}`);
});

module.exports = { createReview, deleteReview };
