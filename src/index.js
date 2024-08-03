const express = require("express");
const mongoose = require("mongoose");
const app = require("./app");

let server;

mongoose
    .connect("mongodb://localhost:27017/tiki_blog")
    .then(() => {
        console.log("Connected successfully to the DB");

        server = app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch(() => {
        console.error("Error connecting to the DB");
    });
