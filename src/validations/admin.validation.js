const Joi = require("joi");
const { objectId, password, username } = require("./custom.validation");

const createUser = {
    body: Joi.object().keys({
        username: Joi.string().required().custom(username),
        password: Joi.string().required().custom(password),
        profilePicture: Joi.string(),
        bio: Joi.string(),
        role: Joi.string().valid("admin", "author", "user"),
    }),
};

const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    createUser,
    deleteUser,
};
