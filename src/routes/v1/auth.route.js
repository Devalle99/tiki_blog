const express = require("express");
const authController = require("../../controllers/auth.controller");
const verifyAuth = require("../../middlewares/verifyAuth");

const router = express.Router();

router.post("/login", authController.login);

router.post("/signup", authController.signup);

router.post("/logout", verifyAuth, authController.logout);

router.delete("/delete-account", verifyAuth, authController.deleteAccount);

module.exports = router;
