const Joi = require("joi");
const { objectId } = require("./custom.validation");

const list = {
    query: Joi.object().keys({
        inTitle: Joi.string(),
        forAuthor: Joi.boolean(),
    }),
};

const getById = {
    params: Joi.object().keys({
        articleId: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    list,
    getById,
};
