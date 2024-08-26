const Joi = require("joi");
const { password, username } = require("./custom.validation");

const login = {
    body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const signup = {
    body: Joi.object().keys({
        username: Joi.string().required().custom(username),
        password: Joi.string().required().custom(password),
    }),
};

module.exports = {
    login,
    signup,
};
