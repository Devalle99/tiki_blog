const passport = require("passport");
const { User, Article } = require("../models");
const generatePassword = require("../utils/passwordUtils").generatePassword;
const catchAsync = require("../utils/catchAsync");

const signup = catchAsync(async (req, res, next) => {
    const { hash, salt } = generatePassword(req.body.password);

    const newUser = new User({
        username: req.body.username,
        hash,
        salt,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
});

const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Failed to authenticate",
                info,
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.json({
                success: true,
                message: "Authenticated successfully",
            });
        });
    })(req, res, next);
};

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to log out",
                error: err,
            });
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    });
};

const deleteAccount = catchAsync(async (req, res) => {
    const id = req.session.passport.user;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res
            .status(404)
            .json({ success: false, message: "User not found" });
    }

    const updatedArticles = await Article.updateMany(
        { author: id },
        { $set: { authorHasLeft: true } }
    );

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        modifiedArticleCount: updatedArticles.modifiedCount,
    });
});

module.exports = {
    signup,
    login,
    logout,
    deleteAccount,
};
