const { Article, Like } = require("../models");
const catchAsync = require("../utils/catchAsync");
const wordCount = require("word-count");

const listArticles = catchAsync(async (req, res) => {
    let {
        searchIn = "title",
        page = 1,
        limit = 10,
        searchQuery = null,
    } = req.body;

    const aggregationPipeline = [
        {
            $match: {
                status: "published",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorDetails",
            },
        },
        {
            $unwind: "$authorDetails",
        },
    ];

    if (searchQuery) {
        if (searchIn === "author") {
            aggregationPipeline.push({
                $match: {
                    "authorDetails.username": new RegExp(searchQuery, "i"),
                },
            });
        } else if (searchIn === "tag") {
            aggregationPipeline.push({
                $lookup: {
                    from: "tags",
                    localField: "tags",
                    foreignField: "_id",
                    as: "tagDetails",
                },
            });
            aggregationPipeline.push({ $unwind: "$tagDetails" });
            aggregationPipeline.push({
                $match: {
                    "tagDetails.name": new RegExp(searchQuery, "i"),
                },
            });
        } else if (searchIn === "title") {
            aggregationPipeline.push({
                $match: {
                    title: new RegExp(searchQuery, "i"),
                },
            });
        }
    }

    aggregationPipeline.push(
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
                viewCount: -1,
                likeCount: -1,
                commentCount: -1,
            },
        },
        {
            $skip: (page - 1) * Number(limit),
        },
        {
            $limit: Number(limit),
        },
        {
            $project: {
                title: 1,
                content: 1,
                author: {
                    _id: "$author",
                    username: "$authorDetails.username",
                },
                excerpt: 1,
                status: 1,
                viewCount: 1,
                likeCount: 1,
                commentCount: 1,
                thumbnailUrl: 1,
                slug: 1,
                readTime: 1,
                authorHasLeft: 1,
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
        });
    } else {
        res.status(200).json({
            success: true,
            message: "The article(s) were retrieved successfully",
            total: totalArticles,
            page: Number(page),
            limit: Number(limit),
            result: articlesAggregation,
        });
    }
});

const getArticle = catchAsync(async (req, res) => {
    // TODO: devolver el articulo solamente si tiene status published
    const { articleId } = req.params;

    const article = await Article.findById(articleId)
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

    res.status(200).json({
        success: true,
        message: "The article was retrieved successfully",
        result: {
            ...article.toObject(),
            likeCount,
            commentCount,
        },
    });
});

module.exports = {
    listArticles,
    getArticle,
};
