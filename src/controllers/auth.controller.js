const passport = require("passport");
const { User, Article } = require("../models");
const generatePassword = require("../utils/passwordUtils").generatePassword;

const signup = (req, res, next) => {
    try {
        const saltHash = generatePassword(req.body.password);

        const salt = saltHash.salt;
        const hash = saltHash.hash;

        const newUser = new User({
            username: req.body.username,
            hash,
            salt,
        });

        newUser.save().then((user) => {
            console.log(user);
        });

        res.status(201).json({ message: "User created" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Fallo en la autenticación",
                info,
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.json({
                success: true,
                message: "Autenticación exitosa",
                user,
            });
        });
    })(req, res, next);
};

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error al cerrar sesión",
                error: err,
            });
        }
        res.json({ success: true, message: "Sesión cerrada exitosamente" });
    });
};

const deleteAccount = async (req, res) => {
    try {
        const id = req.session.passport.user;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedArticles = await Article.updateMany(
            { author: id },
            { $set: { authorHasLeft: true } }
        );

        res.status(200).json({
            message: "User deleted successfully",
            modifiedArticles: updatedArticles.modifiedCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
    deleteAccount,
};
