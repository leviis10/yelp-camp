const express = require("express");

const { createReview, deleteReview } = require("../controllers/reviews");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isReviewAuthor = require("../middlewares/isReviewAuthor");
const validateSchema = require("../middlewares/validateSchema");
const reviewSchema = require("../validationSchema/reviewSchema");

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateSchema(reviewSchema), createReview);

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, deleteReview);

module.exports = router;
