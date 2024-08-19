const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        articleId: {
            type: Schema.Types.ObjectId,
            ref: "Article",
            required: true,
        },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

const ArticleSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        excerpt: String,
        publicationDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        viewCount: { type: Number, default: 0 },
        comments: [CommentSchema],
        thumbnailUrl: String,
        slug: { type: String, unique: true },
        readTime: Number,
        authorHasLeft: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ArticleSchema.virtual("likeCount", {
    ref: "Like",
    localField: "_id",
    foreignField: "articleId",
    count: true,
});

module.exports = mongoose.model("Article", ArticleSchema);
