const express = require("express");
const multer = require("multer");

const {
  index,
  renderNewForm,
  renderEditForm,
  showCampground,
  createCampground,
  updateCampground,
  deleteCampground,
} = require("../controllers/campgrounds");
const isAuthor = require("../middlewares/isAuthor");
const isLoggedIn = require("../middlewares/isLoggedIn");
const validateSchema = require("../middlewares/validateSchema");
const { storage } = require("../utils/cloudinary");
const campgroundSchema = require("../validationSchema/campgroundSchema");

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(index)
  .post(
    isLoggedIn,
    upload.array("images"),
    validateSchema(campgroundSchema),
    createCampground
  );

router.get("/new", isLoggedIn, renderNewForm);

router
  .route("/:id")
  .get(showCampground)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("images"),
    validateSchema(campgroundSchema),
    updateCampground
  )
  .delete(isLoggedIn, isAuthor, deleteCampground);

router.get("/:id/edit", isLoggedIn, isAuthor, renderEditForm);

module.exports = router;
