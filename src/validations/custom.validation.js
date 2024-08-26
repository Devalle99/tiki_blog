const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"{{#label}}" must be a valid mongo id');
    }
    return value;
};

const password = (value, helpers) => {
    if (value.length < 8) {
        return helpers.message("password must be at least 8 characters");
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        return helpers.message(
            "password must contain at least 1 letter and 1 number"
        );
    }
    return value;
};

const username = (value, helpers) => {
    if (value.length < 3) {
        return helpers.message("username must be at least 3 characters");
    }
    if (value.length > 20) {
        return helpers.message("username must be at most 20 characters");
    }
    if (!value.match(/^[\w-]+$/)) {
        return helpers.message(
            "username can only contain alphanumeric characters, low dashes and dashes"
        );
    }
    return value;
};

module.exports = {
    objectId,
    password,
    username,
};
