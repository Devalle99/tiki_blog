require("dotenv").config();
const mongoose = require("mongoose");

let conn;

const connectDB = async () => {
    if (!conn) {
        const uri =
            process.env.NODE_ENV === "test"
                ? global.__MONGO_URI__
                : process.env.MONGO_URI;

        conn = await mongoose.connect(uri);
        console.log("Connected successfully to the DB");
    }
    return conn;
};

const getClient = () => {
    return mongoose.connection.getClient();
};

module.exports = { connectDB, getClient };
