const Joi = require("joi");
const { objectId } = require("./custom.validation");

const list = {
    query: Joi.object().keys({
        title: Joi.string().max(210), // 70 characters for title times the max length of url encoded characters (3)
        sort: Joi.string().valid("relevance", "publicationDate"),
        order: Joi.string().valid("asc", "desc"),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(25),
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
