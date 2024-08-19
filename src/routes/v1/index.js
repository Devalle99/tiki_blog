const express = require("express");
const articleRoute = require("./article.route");
const authorRoute = require("./author.route");
const commentRoute = require("./comment.route");
const tagRoute = require("./tag.route");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");

const router = express.Router();

const defaultRoutes = [
    {
        path: "/articles",
        route: articleRoute,
    },
    {
        path: "/author",
        route: authorRoute,
    },
    {
        path: "/comments",
        route: commentRoute,
    },
    {
        path: "/tags",
        route: tagRoute,
    },
    {
        path: "/users",
        route: userRoute,
    },
    {
        path: "/auth",
        route: authRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
