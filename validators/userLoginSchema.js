const Joi = require("joi");

const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { userLoginSchema };
