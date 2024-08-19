const Joi = require("joi");
const { objectId } = require("./custom.validation");
const wordCount = require("word-count");

const articleTitle = (value, helpers) => {
    if (wordCount(value) === 0) {
        return helpers.message("article title must be at least one word long");
    }
    if (wordCount(value) > 18) {
        return helpers.message("article title cannot be longer than 18 words");
    }
    if (value.length > 70) {
        return helpers.message(
            "article title cannot be longer than 70 characters"
        );
    }
    return value;
};

const articleContent = (value, helpers) => {
    // if (wordCount(value) < 30) {
    //     return helpers.message(
    //         "article content must be at least 30 words long"
    //     );
    // }
    if (wordCount(value) > 2500) {
        return helpers.message(
            "article content cannot be longer than 2500 words"
        );
    }
    return value;
};

const articleExcerpt = (value, helpers) => {
    if (wordCount(value) < 5) {
        return helpers.message("article excerpt must be at least 5 words long");
    }
    if (wordCount(value) > 50) {
        return helpers.message(
            "article excerpt cannot be longer than 50 words"
        );
    }
    return value;
};

const list = {
    query: Joi.object().keys({
        status: Joi.string().valid("draft", "published"),
        title: Joi.string().max(210), // 70 characters for title times the max length of url encoded characters (3)
        // the sorting is assumed to be by publication date
        order: Joi.string().valid("asc", "desc"),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(25),
    }),
};

const get = {
    params: Joi.object().keys({
        articleId: Joi.string().required().custom(objectId),
    }),
};

const create = {
    body: Joi.object().keys({
        title: Joi.string().required().custom(articleTitle),
        content: Joi.string().required().custom(articleContent),
        tags: Joi.array().items(Joi.string().custom(objectId)),
        excerpt: Joi.string().custom(articleExcerpt),
        status: Joi.string().valid("draft", "published"),
        thumbnailUrl: Joi.string().uri(),
        slug: Joi.string()
            .pattern(/^[a-z0-9-]+$/)
            .required()
            .min(5)
            .max(35),
        publicationDate: Joi.date().required().max("now").messages({
            "date.max": "Publication date cannot be greater than today's date.",
        }),
    }),
};

const update = {
    body: Joi.object()
        .keys({
            title: Joi.string().custom(articleTitle),
            content: Joi.string().custom(articleContent),
            tags: Joi.array().items(Joi.string().custom(objectId)),
            excerpt: Joi.string().custom(articleExcerpt),
            status: Joi.string().valid("draft", "published", "archived"),
            thumbnailUrl: Joi.string().uri(),
            slug: Joi.string()
                .pattern(/^[a-z0-9-]+$/)
                .min(5)
                .max(35),
            publicationDate: Joi.date().max("now").messages({
                "date.max":
                    "Publication date cannot be greater than today's date.",
            }),
        })
        .min(1), // At least one field must be updated
};

const deleteById = {
    params: Joi.object().keys({
        articleId: Joi.string().required().custom(objectId),
    }),
};

module.exports = {
    list,
    get,
    create,
    update,
    deleteById,
};
