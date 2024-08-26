const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// user schema
const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        // email: { type: String, required: true, unique: true },
        hash: { type: String, required: true },
        salt: { type: String, required: true },
        profilePicture: String,
        bio: String,
        role: {
            type: String,
            enum: ["admin", "author", "user"],
            default: "user",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
