const express = require("express");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes/v1");
const MongoStore = require("connect-mongo");
const { connectDB, getClient } = require("./config/database");
require("./config/passport");
require("dotenv").config();
const ApiError = require("./utils/ApiError");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {
    app.use(
        session({
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
            },
            store: MongoStore.create({
                client: getClient(),
                collectionName: "sessions",
            }),
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1", routes);

    // send back a 404 error for any unknown api request
    app.use((req, res, next) => {
        next(new ApiError(404, "Not found"));
    });

    app.use(errorHandler);
});

module.exports = app;
