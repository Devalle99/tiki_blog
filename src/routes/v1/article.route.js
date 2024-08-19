const express = require("express");
const articleController = require("../../controllers/article.controller");
const verifyAuth = require("../../middlewares/verifyAuth");
const verifyArticleAuthorship = require("../../middlewares/verifyArticleAuthorship");
const validate = require("../../middlewares/validate");
const { articleValidation } = require("../../validations");

const router = express.Router();

router.get(
    "/",
    validate(articleValidation.list),
    articleController.listArticles
);

router.get(
    "/:articleId",
    validate(articleValidation.getById),
    articleController.getArticle
);

module.exports = router;
