const ApiError = require("../utils/ApiError");

module.exports = (roles) => {
    return (req, res, next) => {
        if (req.isAuthenticated() && roles.includes(req.user.role)) {
            return next();
        } else {
            return next(
                new ApiError(403, "Forbidden: you lack necessary permissions")
            );
        }
    };
};
