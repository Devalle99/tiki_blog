const { MongoMemoryServer } = require("mongodb-memory-server");
const connectDB = require("../../src/config/database").connectDB;
const mongoose = require("mongoose");
const request = require("supertest");
const { generatePassword } = require("../../src/utils/passwordUtils");

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

const generateSetup = async (app) => {
    // Create admin user
    const { User } = require("../../src/models");

    const { hash, salt } = generatePassword("Password1234");

    const adminUser = new User({
        username: "adminUser",
        role: "admin",
        hash,
        salt,
    });

    await adminUser.save();

    const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "adminUser", password: "Password1234" });

    const adminCookie = loginResponse.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("connect.sid")
    );

    return {
        async createUser(userObject) {
            await request(app)
                .post("/api/v1/admin/user")
                .set("Cookie", adminCookie)
                .send(userObject);

            return {
                username: userObject.username,
                password: userObject.password,
            };
        },

        async login(credentials) {
            const loginResponse = await request(app)
                .post("/api/v1/auth/login")
                .send(credentials);

            const cookie = loginResponse.headers["set-cookie"].find((cookie) =>
                cookie.startsWith("connect.sid")
            );

            return cookie;
        },

        articleCount: 0, // used for keeping track of created articles
        async createArticles(
            cookie,
            count = 1,
            titlePrefix = "Test Article",
            status = "published"
        ) {
            try {
                if (count < 1 || cookie === null) return;

                const articleIds = [];

                const articleData = {
                    content:
                        "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                    status,
                };

                for (let i = 1; i <= count; i++) {
                    articleData.title = `${titlePrefix} ${this.articleCount}`;

                    articleData.slug = `valid-article-slug-${this.articleCount}`;

                    articleData.publicationDate = new Date(
                        new Date().setDate(
                            new Date().getDate() - this.articleCount
                        )
                    );
                    this.articleCount++;

                    const articleResponse = await request(app)
                        .post("/api/v1/author/articles")
                        .set("Cookie", cookie)
                        .send(articleData);

                    if (this.articleCount === 0) console.log(articleResponse);

                    articleIds.push(articleResponse.body.result._id);
                }

                return articleIds;
            } catch (e) {
                console.error(`At article number ${this.articleCount}`, e);
            }
        },
    };
};

module.exports = { globalSetup, globalTeardown, clearDB, generateSetup };
