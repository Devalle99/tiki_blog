const ApiError = require("../utils/ApiError");

module.exports = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return next(new ApiError(401, "User not authenticated"));
};
