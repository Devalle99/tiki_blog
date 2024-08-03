const Joi = require("joi");

const create = Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string),
    excerpt: Joi.string(),
    status: Joi.string(),
    thumbnailUrl: Joi.string(),
    slug: Joi.string(),
});

module.exports = create;
