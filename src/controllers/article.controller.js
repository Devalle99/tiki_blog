const { Article } = require("../models");
const catchAsync = require("../utils/catchAsync");

const getArticles = catchAsync(async (req, res) => {
    let {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
        ...filters
    } = req.query;

    limit = limit > 25 ? 25 : limit;

    const sortOrder = order === "asc" ? 1 : -1;

    const articles = await Article.find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalArticles = await Article.countDocuments(filters);

    res.status(200).json({
        total: totalArticles,
        page: Number(page),
        limit: Number(limit),
        articles,
    });
});

const getArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;
    const article = await Article.findById(articleId);
    res.status(200).json(article);
});

const createArticle = catchAsync(async (req, res) => {
    const userId = req.session.passport.user;

    const article = { ...req.body, author: userId };

    const result = await Article.create(article);

    res.status(200).json(result);
});

const updateArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;
    const article = await Article.findByIdAndUpdate(articleId, req.body, {
        new: true,
    });
    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
});

const deleteArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;
    const article = await Article.findByIdAndDelete(articleId);
    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ message: "Article deleted successfully" });
});

module.exports = {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
};
