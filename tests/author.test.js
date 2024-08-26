const request = require("supertest");
const app = require("../src/app");
const { clearDB, generateSetup } = require("./setup/mainSetup");

describe("List articles", () => {
    let setup;
    let credentials1;
    let credentials2;
    let credentials3;
    let cookie1;
    let cookie2;
    let cookie3;
    let articleIds1 = [];
    let articleIds2 = [];
    let articleIds3 = [];
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "author",
    };
    const user2 = {
        username: "testUser2",
        password: "Password1234",
        role: "author",
    };
    const user3 = {
        username: "testUser3",
        password: "Password1234",
        role: "author",
    };

    beforeEach(async () => {
        setup = await generateSetup(app);

        // Articles for user1
        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();
        articleIds1.push(
            ...(await setup.createArticles(cookie1, 4, "Alpha", "draft"))
        );
        articleIds1.push(
            ...(await setup.createArticles(cookie1, 4, "Alpha", "published"))
        );
        articleIds1.push(
            ...(await setup.createArticles(cookie1, 4, "Beta", "draft"))
        );
        articleIds1.push(
            ...(await setup.createArticles(cookie1, 4, "Beta", "published"))
        );
        expect(articleIds1).toHaveLength(16);

        // Articles for user2
        credentials2 = await setup.createUser(user2);
        cookie2 = await setup.login(credentials2);
        articleIds2.push(...(await setup.createArticles(cookie2, 12)));
        expect(credentials2).toHaveProperty("username", user2.username);
        expect(credentials2).toHaveProperty("password", user2.password);
        expect(cookie2).toBeTruthy();
        expect(articleIds2).toHaveLength(12);

        // Articles for user3
        credentials3 = await setup.createUser(user3);
        cookie3 = await setup.login(credentials3);
        articleIds3.push(...(await setup.createArticles(cookie3, 4)));
        expect(credentials3).toHaveProperty("username", user3.username);
        expect(credentials3).toHaveProperty("password", user3.password);
        expect(cookie3).toBeTruthy();
        expect(articleIds3).toHaveLength(4);
    });

    afterEach(async () => {
        articleIds1 = [];
        articleIds2 = [];
        articleIds3 = [];
        await clearDB();
    });

    it("should list articles, provided with no additional parameters", async () => {
        // first 10 results in descending order, with correct author, any status, any title
        const response = await request(app)
            .get("/api/v1/author/articles")
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(10);

        const result = response.body.result;

        const firstArticleDate = new Date(result.at(0).publicationDate);
        const lastArticleDate = new Date(result.at(-1).publicationDate);
        expect(firstArticleDate > lastArticleDate).toBe(true);

        // Title prefixes
        let alphaExists = false;
        let betaExists = false;
        // Statuses
        let draftExists = false;
        let publishedExists = false;

        result.forEach((article) => {
            expect(article.author.username).toEqual(user1.username);

            if (/Alpha/.test(article.title) && !alphaExists) alphaExists = true;
            if (/Beta/.test(article.title) && !betaExists) betaExists = true;

            if (article.status === "draft" && !draftExists) draftExists = true;
            if (article.status === "published" && !publishedExists)
                publishedExists = true;
        });

        expect(alphaExists && betaExists).toBe(true);
        expect(draftExists && publishedExists).toBe(true);
    });

    it("should filter by title", async () => {
        // Results include only articles with "Alpha" in the title
        const response = await request(app)
            .get("/api/v1/author/articles")
            .query({ title: "Alpha" })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.total).toBe(8);

        const result = response.body.result;
        result.forEach((article) => {
            expect(/Alpha/.test(article.title)).toBe(true);
        });
    });

    it("should filter by status", async () => {
        // Results include only articles with "published" status
        const response = await request(app)
            .get("/api/v1/author/articles")
            .query({ status: "published" })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.total).toBe(8);

        const result = response.body.result;
        result.forEach((article) => {
            expect(article.status).toBe("published");
        });
    });

    it("should list articles ascending order", async () => {
        // The date of every article is compared against the next article
        const response = await request(app)
            .get("/api/v1/author/articles")
            .query({ order: "asc" })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);

        const result = response.body.result;

        for (let i = 0; i < result.length - 1; i++) {
            const articleDate1 = new Date(result.at(i).publicationDate);
            const articleDate2 = new Date(result.at(i + 1).publicationDate);
            expect(articleDate1 < articleDate2).toBe(true);
        }
    });

    it("should return zero articles", async () => {
        const response = await request(app)
            .get("/api/v1/author/articles")
            .query({ title: "Gamma" })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(404);
        expect(response.body.total).toBe(0);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "No articles were found for the query"
        );
    });

    it("should return the correct page and limit of articles", async () => {
        // first 10 results in descending order, with correct author, any status, any title
        const response = await request(app)
            .get("/api/v1/author/articles")
            .query({ page: 3, limit: 4 })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.page).toBe(3);
        expect(response.body.limit).toBe(4);
        expect(response.body.total).toBe(4);

        const result = response.body.result;

        result.forEach((article) => {
            expect(/Beta/.test(article.title)).toBe(true);
            expect(article.status).toBe("draft");
        });
    });
});

describe("Get article by Id", () => {
    let setup;
    let credentials1;
    let cookie1;
    let articleIds1 = [];
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "author",
    };

    beforeEach(async () => {
        setup = await generateSetup(app);

        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();
        articleIds1.push(
            ...(await setup.createArticles(cookie1, 4, "Alpha", "draft"))
        );
        expect(articleIds1).toHaveLength(4);
    });

    afterEach(async () => {
        articleIds1 = [];
        await clearDB();
    });

    it("should retrieve an article successfully", async () => {
        const response = await request(app)
            .get(`/api/v1/author/articles/${articleIds1[0]}`)
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "The article was retrieved successfully"
        );
    });

    it("should return a 404, provided a nonexistent article ID", async () => {
        const response = await request(app)
            .get(`/api/v1/author/articles/66b2df7f9490ceed81f44b85`)
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("The article was not found");
    });

    /* TODO: Other tests cases that can't be implemented until the controller for likes and comments
     *  are donde include:
     *  - Article has the correct number of comments
     *  - Article has the correct number of likes
     */
});

describe("Create an article", () => {
    let setup;
    let credentials1;
    let cookie1;
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "author",
    };

    beforeEach(async () => {
        setup = await generateSetup(app);

        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();
    });

    afterEach(async () => {
        await clearDB();
    });

    it("should create an article successfully", async () => {
        const response = await request(app)
            .post("/api/v1/author/articles")
            .send({
                title: "Article title",
                content:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                // tags,
                excerpt:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam",
                status: "published",
                thumbnailUrl:
                    "https://i.pinimg.com/originals/19/30/a6/1930a639e02a1dfa7b8158428c36ae2d.jpg",
                slug: "article-slug",
                publicationDate: new Date(),
            })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "The article was created successfully"
        );
    });
});

describe("Update an article", () => {
    let setup;
    let credentials1;
    let cookie1;
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "author",
    };

    let response;
    let originalArticle;

    beforeEach(async () => {
        setup = await generateSetup(app);

        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();

        response = await request(app)
            .post("/api/v1/author/articles")
            .send({
                title: "Article title",
                content:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                // tags,
                excerpt:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam",
                status: "published",
                thumbnailUrl:
                    "https://i.pinimg.com/originals/19/30/a6/1930a639e02a1dfa7b8158428c36ae2d.jpg",
                slug: "article-slug",
                publicationDate: new Date(),
            })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "The article was created successfully"
        );

        originalArticle = response.body.result;
    });

    afterEach(async () => {
        await clearDB();
    });

    it("should update an article successfully", async () => {
        // Updating almost every property in the original article and verifying the difference
        response = await request(app)
            .put(`/api/v1/author/articles/${originalArticle._id}`)
            .send({
                title: "Updated article title",
                content:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris." +
                    " Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris." +
                    " Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                // tags,
                excerpt:
                    "Consectetur adipiscing elit integer aliquam lorem ipsum dolor sit amet",
                status: "draft",
                thumbnailUrl:
                    "https://static.wikia.nocookie.net/lotr/images/4/4b/Young_Bilbo_S_Morello.png/revision/latest?cb=20240115164327",
                slug: "new-article-slug",
                publicationDate: new Date(
                    new Date().setDate(new Date().getDate() - 1)
                ),
            })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "The article was updated successfully"
        );

        const result = response.body.result;

        function arePropertiesDifferent(obj1, obj2) {
            for (let key in obj1) {
                if (key === "tags" || key === "_id") continue;

                if (obj2.hasOwnProperty(key)) {
                    expect(obj1[key]).not.toBe(obj2[key]);
                }
            }
        }

        arePropertiesDifferent(originalArticle, result);
    });

    it("should return a 404, provided a nonexistent article ID", async () => {
        const response = await request(app)
            .put(`/api/v1/author/articles/66b2df7f9490ceed81f44b85`)
            .send({
                title: "Updated article title",
            })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("The article was not found");
    });
});

describe("Delete an article", () => {
    let setup;
    let credentials1;
    let cookie1;
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "author",
    };

    let response;
    let article;

    beforeEach(async () => {
        setup = await generateSetup(app);

        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();

        response = await request(app)
            .post("/api/v1/author/articles")
            .send({
                title: "Article title",
                content:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                // tags,
                excerpt:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam",
                status: "published",
                thumbnailUrl:
                    "https://i.pinimg.com/originals/19/30/a6/1930a639e02a1dfa7b8158428c36ae2d.jpg",
                slug: "article-slug",
                publicationDate: new Date(),
            })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "The article was created successfully"
        );

        article = response.body.result;
        expect(article).toBeTruthy();
    });

    afterEach(async () => {
        await clearDB();
    });

    it("should delete an article successfully", async () => {
        response = await request(app)
            .delete(`/api/v1/author/articles/${article._id}`)
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "The article was deleted successfully"
        );
    });

    it("should return a 404, provided a nonexistent article ID", async () => {
        const response = await request(app)
            .delete("/api/v1/author/articles/66b2df7f9490ceed81f44b85")
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("The article was not found");
    });
});

describe("Unauthenticated requests", () => {
    it("should fail to List articles", async () => {
        const response = await request(app).get("/api/v1/author/articles");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not authenticated");
    });

    it("should fail to Get an article", async () => {
        const response = await request(app).get(
            "/api/v1/author/articles/66b2df7f9490ceed81f44b85"
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not authenticated");
    });

    it("should fail to Create an article", async () => {
        const response = await request(app)
            .post("/api/v1/author/articles")
            .send({
                title: "Article title",
                content:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                // tags,
                excerpt:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam",
                status: "published",
                thumbnailUrl:
                    "https://i.pinimg.com/originals/19/30/a6/1930a639e02a1dfa7b8158428c36ae2d.jpg",
                slug: "article-slug",
                publicationDate: new Date(),
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not authenticated");
    });

    it("should fail to Update an article", async () => {
        const response = await request(app).put(
            "/api/v1/author/articles/66b2df7f9490ceed81f44b85"
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not authenticated");
    });

    it("should fail to Delete an article", async () => {
        const response = await request(app).delete(
            "/api/v1/author/articles/66b2df7f9490ceed81f44b85"
        );

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not authenticated");
    });
});

describe('Requests made by a user with a role other than "author"', () => {
    let setup;
    let credentials1;
    let cookie1;
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "user",
    };

    beforeEach(async () => {
        setup = await generateSetup(app);

        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();
    });

    afterEach(async () => {
        await clearDB();
    });

    it("should fail to List articles", async () => {
        const response = await request(app)
            .get("/api/v1/author/articles")
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Forbidden: you lack necessary permissions"
        );
    });

    it("should fail to Get an article", async () => {
        const response = await request(app)
            .get("/api/v1/author/articles/66b2df7f9490ceed81f44b85")
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Forbidden: you lack necessary permissions"
        );
    });

    it("should fail to Create an article", async () => {
        const response = await request(app)
            .post("/api/v1/author/articles")
            .send({
                title: "Article title",
                content:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam pellentesque, mollis tristique cras fringilla ornare netus ligula cursus feugiat, urna nunc nam hac ullamcorper ultricies lectus dictumst phasellus. Magna neque facilisi venenatis mollis leo suscipit suspendisse risus commodo at pulvinar, elementum aenean ullamcorper scelerisque dignissim aliquet viverra morbi egestas nisl. Augue ultrices laoreet sed sem urna aenean non malesuada, metus fames vitae ante sapien ac nostra. Porttitor justo curae facilisis vestibulum mus parturient integer purus nunc hac condimentum dui, tempor montes interdum morbi enim turpis vulputate sociosqu placerat iaculis imperdiet. Placerat phasellus libero tincidunt ridiculus dignissim conubia porttitor, cursus urna luctus aliquam litora nostra habitant at, pellentesque inceptos magna molestie venenatis parturient. Venenatis consequat velit natoque ac lobortis malesuada euismod varius, placerat iaculis leo vestibulum risus diam cum, luctus ornare neque aliquet aptent tincidunt mauris.",
                // tags,
                excerpt:
                    "Lorem ipsum dolor sit amet consectetur adipiscing elit integer aliquam",
                status: "published",
                thumbnailUrl:
                    "https://i.pinimg.com/originals/19/30/a6/1930a639e02a1dfa7b8158428c36ae2d.jpg",
                slug: "article-slug",
                publicationDate: new Date(),
            })
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Forbidden: you lack necessary permissions"
        );
    });

    it("should fail to Update an article", async () => {
        const response = await request(app)
            .put("/api/v1/author/articles/66b2df7f9490ceed81f44b85")
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Forbidden: you lack necessary permissions"
        );
    });

    it("should fail to Delete an article", async () => {
        const response = await request(app)
            .delete("/api/v1/author/articles/66b2df7f9490ceed81f44b85")
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Forbidden: you lack necessary permissions"
        );
    });
});

describe("Requests made by an author that didn't create the article he is trying to manage", () => {
    let setup;
    let credentials1;
    let credentials2;
    let cookie1;
    let cookie2;
    let articleIds1 = [];
    let articleIds2 = [];
    const user1 = {
        username: "testUser1",
        password: "Password1234",
        role: "author",
    };
    const user2 = {
        username: "testUser2",
        password: "Password1234",
        role: "author",
    };

    beforeEach(async () => {
        setup = await generateSetup(app);

        credentials1 = await setup.createUser(user1);
        expect(credentials1).toHaveProperty("username", user1.username);
        expect(credentials1).toHaveProperty("password", user1.password);
        cookie1 = await setup.login(credentials1);
        expect(cookie1).toBeTruthy();
        articleIds1.push(...(await setup.createArticles(cookie1)));
        expect(articleIds1).toHaveLength(1);

        credentials2 = await setup.createUser(user2);
        expect(credentials2).toHaveProperty("username", user2.username);
        expect(credentials2).toHaveProperty("password", user2.password);
        cookie2 = await setup.login(credentials2);
        expect(cookie2).toBeTruthy();
        articleIds2.push(...(await setup.createArticles(cookie2)));
        expect(articleIds2).toHaveLength(1);
    });

    afterEach(async () => {
        articleIds1 = [];
        articleIds2 = [];
        await clearDB();
    });

    it("should fail to Get an article", async () => {
        const response = await request(app)
            .get(`/api/v1/author/articles/${articleIds2[0]}`)
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "You are not the author of the resource you are trying to manage"
        );
    });

    it("should fail to Update an article", async () => {
        const response = await request(app)
            .put(`/api/v1/author/articles/${articleIds2[0]}`)
            .send({ title: "New article title" })
            .set("Cookie", cookie1);

        // expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "You are not the author of the resource you are trying to manage"
        );
    });

    it("should fail to Delete an article", async () => {
        const response = await request(app)
            .delete(`/api/v1/author/articles/${articleIds2[0]}`)
            .set("Cookie", cookie1);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "You are not the author of the resource you are trying to manage"
        );
    });
});
