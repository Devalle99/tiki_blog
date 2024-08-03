// Middleware to verify authentication
module.exports = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ success: false, message: "User not authenticated" });
};
