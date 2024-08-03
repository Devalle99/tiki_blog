const express = require("express");
const session = require("express-session");
var passport = require("passport");
const routes = require("./routes/v1");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
// require("dotenv").config();
require("./config/passport");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//////////////////////////////
const conn = "mongodb://localhost:27017/tiki_blog";

// const connection = mongoose.createConnection(conn, {});

// const sessionStore = MongoStore.create({
//     mongoUrl: connection,
//     collection: "sessions",
// });

app.use(
    session({
        secret: "papuliftshimself",
        store: MongoStore.create({
            mongoUrl: conn,
            // collection: "sessions",
        }),
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

// ------------------------------------

// app.use(
//     session({
//         secret: process.env.SECRET,
//         store: MongoStore.create(options),
//     })
// );

////////////////////////////////////

app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//     console.log(req.session);
//     console.log(req.user);
//     next();
// });

app.use("/api/v1", routes);

module.exports = app;
