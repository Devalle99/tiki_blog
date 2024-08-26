const { Article, Like } = require("../models");
const catchAsync = require("../utils/catchAsync");

const listArticles = catchAsync(async (req, res) => {
    let {
        title = null,
        sort = "relevance",
        order = "desc",
        page = 1,
        limit = 10,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

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
        }
    );

    let sortOptions = {};

    if (sort === "relevance") {
        sortOptions = {
            viewCount: order === "asc" ? 1 : -1,
            likeCount: order === "asc" ? 1 : -1,
            commentCount: order === "asc" ? 1 : -1,
        };
    } else if (sort === "publicationDate") {
        sortOptions = {
            publicationDate: order === "asc" ? 1 : -1,
        };
    }

    aggregationPipeline.push({ $sort: sortOptions });

    aggregationPipeline.push(
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
                author: {
                    _id: "$author",
                    username: "$authorDetails.username",
                },
                excerpt: 1,
                "tags._id": 1,
                "tags.name": 1,
                viewCount: 1,
                likeCount: 1,
                commentCount: 1,
                thumbnailUrl: 1,
                slug: 1,
                readTime: 1,
                publicationDate: 1,
                createdAt: 1,
                updatedAt: 1,
                authorHasLeft: 1,
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
            page: page,
            limit: limit,
            result: articlesAggregation,
        });
    }
});

const getArticle = catchAsync(async (req, res) => {
    const { articleId } = req.params;

    const article = await Article.findOneAndUpdate(
        { _id: articleId, status: "published" },
        { $inc: { viewCount: 1 } }, // Increment the viewCount
        { new: false } // Return the article before incrementing the viewCount
    )
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

    delete result.status;
    delete result.__v;

    res.status(200).json({
        success: true,
        message: "The article was retrieved successfully",
        result,
    });
});

module.exports = {
    listArticles,
    getArticle,
};
