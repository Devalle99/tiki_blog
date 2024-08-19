const Article = require("../models").Article;
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

module.exports = async function verifyArticleAuthorship(req, res, next) {
    const { articleId } = req.params;
    const userId = req.session.passport.user;

    const article = await Article.findById(articleId);

    if (!article) {
        return next(new ApiError(404, "Article not found"));
    }

    if (article.author.toString() !== userId.toString()) {
        return next(
            new ApiError(403, "You are not authorized to perform this action")
        );
    }

    next();
};
