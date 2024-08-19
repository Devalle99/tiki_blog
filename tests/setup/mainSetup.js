const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const connectDB = require("../../src/config/database").connectDB;
const request = require("supertest");

let mongoServer;

const globalSetup = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    global.__MONGO_URI__ = uri;

    await connectDB();
};

const globalTeardown = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

const clearDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

const generateSetup = (app) => ({
    articleIds: [],
    cookie: null,

    async createUser() {
        const user = {
            username: "testUser",
            password: "Password123",
        };

        await request(app).post("/api/v1/auth/signup").send(user);
        this.credentials = user;

        return this;
    },

    async login() {
        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send(this.credentials);

        this.cookie = loginResponse.headers["set-cookie"].find((cookie) =>
            cookie.startsWith("connect.sid")
        );

        return this;
    },

    async createArticles(count = 1) {
        if (count < 1 || this.cookie === null) return;

        const articleData = {
            title: "Test Article",
            content:
                "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
        };

        for (let i = 1; i <= count; i++) {
            articleData.slug = `valid-article-slug-${i}`;

            const articleResponse = await request(app)
                .post("/api/v1/articles")
                .set("Cookie", this.cookie)
                .send(articleData);

            this.articleIds.push(articleResponse.body._id);
        }
        return this;
    },

    getArticleId() {
        if (this.articleIds.length > 0) return this.articleIds[0];
    },
});

module.exports = { globalSetup, globalTeardown, clearDB, generateSetup };
