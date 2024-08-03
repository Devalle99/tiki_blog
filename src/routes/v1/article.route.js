const express = require("express");
const articleController = require("../../controllers/article.controller");
const verifyAuth = require("../../middlewares/verifyAuth");
const validate = require("../../middlewares/validate");
const { articleValidation } = require("../../validations");

const router = express.Router();

router.get("/", articleController.getArticles);

router.get("/:id", articleController.getArticle);

router.post(
    "/",
    verifyAuth,
    validate(articleValidation),
    articleController.createArticle
);

router.put(
    "/:id",
    verifyAuth,
    validate(articleValidation),
    articleController.updateArticle
);

router.delete("/:id", verifyAuth, articleController.deleteArticle);

module.exports = router;
