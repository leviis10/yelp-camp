const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const Campground = require("../models/Campground");
const catchAsync = require("../utils/catchAsync");
const { cloudinary } = require("../utils/cloudinary");

const geocodingService = mbxGeocoding({
  accessToken: process.env.MAPBOX_TOKEN,
});

const index = catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

const renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

const showCampground = catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");

  // Success Case
  if (campground) return res.render("campgrounds/show", { campground });

  // Error Case
  req.flash("error", "Can't find that campground");
  res.redirect("/campgrounds");
});

const renderEditForm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  // Success Case
  if (campground) return res.render("campgrounds/edit", { campground });

  // Error Case
  req.flash("error", "Can't find that campground");
  res.redirect("/campgrounds");
});

const createCampground = catchAsync(async (req, res) => {
  // Forward Geocode the Location
  const geoData = await geocodingService
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  // Create new Campground
  const campground = new Campground({
    ...req.body.campground,
    author: req.user._id,
    images: req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    })),
    geometry: geoData.body.features[0].geometry,
  });
  await campground.save();

  // Response
  req.flash("success", "successfully made a new campground");
  res.redirect(`/campgrounds/${campground.id}`);
});

const updateCampground = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Update Campground
  await Campground.findByIdAndUpdate(id, {
    $set: req.body.campground,
    $push: {
      images: {
        $each: req.files.map((file) => ({
          url: file.path,
          filename: file.filename,
        })),
      },
    },
  });

  // Delete images
  if (req.body.deleteImages) {
    req.body.deleteImages.forEach(async (filename) => {
      await cloudinary.uploader.destroy(filename);
    });
    await Campground.findByIdAndUpdate(id, {
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "successfully updated a campground");
  res.redirect(`/campgrounds/${id}`);
});

const deleteCampground = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  req.flash("success", "Campground Deleted Successfully");
  res.redirect("/campgrounds");
});

module.exports = {
  index,
  renderNewForm,
  showCampground,
  renderEditForm,
  createCampground,
  updateCampground,
  deleteCampground,
};
