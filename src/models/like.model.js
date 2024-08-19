const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    articleId: {
        type: Schema.Types.ObjectId,
        ref: "Article",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
