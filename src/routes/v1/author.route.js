const express = require("express");
const authorController = require("../../controllers/author.controller");
const verifyAuth = require("../../middlewares/verifyAuth");
const checkRole = require("../../middlewares/checkRole");
const verifyArticleAuthorship = require("../../middlewares/verifyArticleAuthorship");
const validate = require("../../middlewares/validate");
const { authorValidation } = require("../../validations");

const router = express.Router();

router.get(
    "/articles",
    verifyAuth,
    checkRole("author"),
    validate(authorValidation.list),
    authorController.listArticles
);

router.get(
    "/articles/:articleId",
    verifyAuth,
    checkRole("author"),
    validate(authorValidation.get),
    authorController.getArticle
);

router.post(
    "/articles",
    verifyAuth,
    checkRole("author"),
    validate(authorValidation.create),
    authorController.createArticle
);

router.put(
    "/articles/:articleId",
    verifyAuth,
    checkRole("author"),
    verifyArticleAuthorship,
    validate(authorValidation.update),
    authorController.updateArticle
);

router.delete(
    "/articles/:articleId",
    verifyAuth,
    checkRole("author"),
    verifyArticleAuthorship,
    validate(authorValidation.deleteById),
    authorController.deleteArticle
);

module.exports = router;
