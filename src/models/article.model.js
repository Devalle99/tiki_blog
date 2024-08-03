const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// article schema
const ArticleSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
        excerpt: String,
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        likes: { type: Number, default: 0 },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
        thumbnailUrl: String,
        slug: { type: String, unique: true },
        readTime: Number,
        authorHasLeft: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
