const Joi = require("../utils/joiExtend");

const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    description: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports = campgroundSchema;
