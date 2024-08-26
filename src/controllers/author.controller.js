const { Article, Like } = require("../models");
const catchAsync = require("../utils/catchAsync");
const wordCount = require("word-count");
const { ObjectId } = require("mongoose").Types;

const listArticles = catchAsync(async (req, res) => {
    let {
        status = null,
        title = null,
        order = "desc", // Sort by publication date
        page = 1,
        limit = 10,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const aggregationPipeline = [
        {
            $match: {
                author: ObjectId.createFromHexString(req.session.passport.user),
            },
        },
    ];

    if (status) {
        aggregationPipeline.push({
            $match: {
                status,
            },
        });
    }

    if (title) {
        aggregationPipeline.push({
            $match: {
                title: new RegExp(title, "i"),
            },
        });
    }

    aggregationPipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
            },
        },
        {
            $unwind: {
                path: "$author",
            },
        },
        {
            $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "articleId",
                as: "likes",
            },
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                commentCount: { $size: "$comments" },
            },
        },
        {
            $sort: {
                publicationDate: order === "asc" ? 1 : -1,
            },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $project: {
                title: 1,
                content: 1,
                "author._id": 1,
                "author.username": 1,
                excerpt: 1,
                publicationDate: 1,
                status: 1,
                "tags._id": 1,
                "tags.name": 1,
                viewCount: 1,
                likeCount: 1,
                commentCount: 1,
                thumbnailUrl: 1,
                slug: 1,
                publicationDate: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        }
    );

    const articlesAggregation = await Article.aggregate(aggregationPipeline);

    const totalArticles = articlesAggregation.length;

    if (totalArticles === 0) {
        res.status(404).json({
            success: false,
            message: "No articles were found for the query",
            total: 0,
            page,
            limit,
            result: [],
        });
    } else {
        res.status(200).json({
            success: true,
            message: "The article(s) were retrieved successfully",
            total: totalArticles,
            page,
            limit,
            result: articlesAggregation,
        });
    }
});

const getArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;

    const article = await Article.findById(articleId, {
        readTime: 0,
        authorHasLeft: 0,
        __v: 0,
    })
        .populate("author", "username")
        .populate("tags", "name")
        .exec();

    if (!article) {
        return res.status(404).json({
            success: false,
            message: "The article was not found",
        });
    }

    const likeCount = await Like.countDocuments({ articleId });

    const commentCount = article.comments.length;

    const result = {
        ...article.toObject(),
        likeCount,
        commentCount,
    };

    // The array of comments is ommited, while the comment count is kept
    delete result.comments;

    res.status(200).json({
        success: true,
        message: "The article was retrieved successfully",
        result,
    });
});

const createArticle = catchAsync(async (req, res) => {
    const userId = req.session.passport.user;

    const readTime = Math.round(wordCount(req.body.content) / 200);

    const article = { ...req.body, author: userId, readTime };

    const createdArticle = await Article.create(article);

    const result = await Article.findById(createdArticle._id, {
        viewCount: 0,
        authorHasLeft: 0,
        comments: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    })
        .populate("author", "username")
        .populate("tags", "name")
        .exec();

    res.status(200).json({
        success: true,
        message: "The article was created successfully",
        result,
    });
});

const updateArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;

    // Update readTime if body has content property
    if (req.body.hasOwnProperty("content")) {
        const readTime = Math.round(wordCount(req.body.content) / 200);
        req.body.readTime = readTime;
    }

    const updatedArticle = await Article.findByIdAndUpdate(articleId, req.body);

    if (!updatedArticle) {
        return res.status(404).json({
            success: false,
            message: "The article was not found",
        });
    }

    const result = await Article.findById(updatedArticle._id, {
        authorHasLeft: 0,
        comments: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    })
        .populate("author", "username")
        .populate("tags", "name")
        .exec();

    res.status(200).json({
        success: true,
        message: "The article was updated successfully",
        result,
    });
});

const deleteArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;
    const article = await Article.findByIdAndDelete(articleId);
    if (!article) {
        return res
            .status(404)
            .json({ success: false, message: "The article was not found" });
    }
    res.status(200).json({
        success: true,
        message: "The article was deleted successfully",
    });
});

module.exports = {
    listArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
};
