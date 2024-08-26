const { User, Article } = require("../models");
const generatePassword = require("../utils/passwordUtils").generatePassword;
const catchAsync = require("../utils/catchAsync");

const createUser = catchAsync(async (req, res, next) => {
    const { hash, salt } = generatePassword(req.body.password);

    delete req.body.password;

    const newUser = new User({
        ...req.body,
        hash,
        salt,
    });

    await newUser.save();

    const userObject = newUser.toObject();
    delete userObject.hash;
    delete userObject.salt;

    res.status(201).json({
        success: true,
        message: "User created successfully",
        result: userObject,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    const id = req.params.userId;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res
            .status(404)
            .json({ success: false, message: "User not found" });
    }

    if (user.role === "author") {
        await Article.updateMany(
            { author: id },
            { $set: { authorHasLeft: true } }
        );
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

// When updating a user, you should not be able to change its role

module.exports = {
    createUser,
    deleteUser,
};
