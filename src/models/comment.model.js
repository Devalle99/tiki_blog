const mongoose = require('mongoose')
const Schema = mongoose.Schema

// comment schema
const CommentSchema = new Schema({
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)