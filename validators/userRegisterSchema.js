const Joi = require("joi");

const userRegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
});

module.exports = { userRegisterSchema };
