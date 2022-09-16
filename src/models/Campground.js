const mongoose = require("mongoose");

const Review = require("./Review");

const { Schema } = mongoose;

const imageSchema = new Schema({
  url: { type: String },
  filename: { type: String },
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const campgroundSchema = new Schema(
  {
    title: { type: String },
    price: { type: Number },
    location: { type: String },
    geometry: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    description: { type: String },
    images: { type: [imageSchema] },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { toJSON: { virtuals: true } }
);

campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

campgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
