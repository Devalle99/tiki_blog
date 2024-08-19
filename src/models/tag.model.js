const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// tag schema
const TagSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: String,
});

module.exports = mongoose.model("Tag", TagSchema);
