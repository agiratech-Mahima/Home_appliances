const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().max(500).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  image_url: Joi.string().uri().optional(),
});

module.exports = { productSchema };
