const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const User = require("../src/models").User;
const connectDB = require("../src/config/database").connectDB;
const generatePassword = require("../src/utils/passwordUtils").generatePassword;

let mongoServer;

const setup = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    global.__MONGO_URI__ = uri;

    await connectDB();
};

const teardown = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

const createTestUser = async () => {
    const { hash, salt } = generatePassword("password");

    await User.create({
        username: "testUser",
        hash,
        salt,
    });
};

const clear = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

module.exports = { setup, teardown, createTestUser, clear };
