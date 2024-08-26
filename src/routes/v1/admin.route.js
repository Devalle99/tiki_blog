const express = require("express");
const adminController = require("../../controllers/admin.controller");
const verifyAuth = require("../../middlewares/verifyAuth");
const checkRole = require("../../middlewares/checkRole");
const validate = require("../../middlewares/validate");
const { adminValidation } = require("../../validations");

const router = express.Router();

router.post(
    "/user",
    verifyAuth,
    checkRole("admin"),
    validate(adminValidation.createUser),
    adminController.createUser
);

router.delete(
    "/user",
    verifyAuth,
    checkRole("admin"),
    validate(adminValidation.deleteUser),
    adminController.deleteUser
);

module.exports = router;
