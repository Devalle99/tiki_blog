const Article = require("../models").Article;
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

module.exports = async function verifyArticleAuthorship(req, res, next) {
    const { articleId } = req.params;
    const userId = req.session.passport.user;

    const article = await Article.findById(articleId);

    if (!article) {
        return next(new ApiError(404, "The article was not found"));
    }

    if (article.author.toString() !== userId.toString()) {
        return next(
            new ApiError(
                403,
                "You are not the author of the resource you are trying to manage"
            )
        );
    }

    next();
};
