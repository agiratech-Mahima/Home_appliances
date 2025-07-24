const Joi = require("joi");

const orderSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  payment_method: Joi.string().valid("COD").required(),
});

module.exports = { orderSchema };
