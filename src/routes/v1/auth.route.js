const express = require("express");
const authController = require("../../controllers/auth.controller");
const verifyAuth = require("../../middlewares/verifyAuth");
const validate = require("../../middlewares/validate");
const { authValidation } = require("../../validations");

const router = express.Router();

router.post("/login", validate(authValidation.login), authController.login);

router.post("/signup", validate(authValidation.signup), authController.signup);

router.post("/logout", verifyAuth, authController.logout);

router.delete("/delete-account", verifyAuth, authController.deleteAccount);

module.exports = router;
