const Joi = require("joi");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: "key" }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return next(new ApiError(400, errorMessages));
    }
    Object.assign(req, value);
    return next();
};

module.exports = validate;
