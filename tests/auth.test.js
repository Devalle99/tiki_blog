const request = require("supertest");
const app = require("../src/app");
const { clearDB, generateSetup } = require("./setup/mainSetup");

afterEach(async () => {
    await clearDB();
});

describe("Signup", () => {
    it("should signup a user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ username: "username", password: "password" });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "User created successfully");
    });

    it("should fail to signup without both a password and a username", async () => {
        const res = await request(app).post("/api/v1/auth/signup").send({});

        expect(res.statusCode).toEqual(500);
    });
});

describe("Login", () => {
    let setup;

    beforeEach(async () => {
        setup = generateSetup(app);
        await setup.createUser();
    });

    it("should login a user successfully", async () => {
        expect(setup.credentials).toBeTruthy();

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send(setup.credentials);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
            "message",
            "Authenticated successfully"
        );
    });

    it("should fail to login with incorrect password", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "testUser", password: "wrongpassword" });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Failed to authenticate");
    });

    it("should fail to login with non-existing user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "nonexistinguser", password: "password" });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Failed to authenticate");
    });
});

describe("Logout", () => {
    it("should logout a user successfully", async () => {
        const setup = generateSetup(app);
        await setup.createUser();
        await setup.login();

        expect(setup.credentials).toBeTruthy();
        expect(setup.cookie).toBeTruthy();

        const logoutResponse = await request(app)
            .post("/api/v1/auth/logout")
            .set("Cookie", setup.cookie);

        expect(logoutResponse.statusCode).toEqual(200);
        expect(logoutResponse.body).toHaveProperty("success", true);
        expect(logoutResponse.body).toHaveProperty(
            "message",
            "Logged out successfully"
        );
    });

    it("should fail to logout an unauthenticated user", async () => {
        const res = await request(app).post("/api/v1/auth/logout");

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "User not authenticated");
    });
});

describe("Delete account", () => {
    it("should delete the user's account successfully", async () => {
        const setup = generateSetup(app);
        await setup.createUser();
        await setup.login();

        expect(setup.cookie).toBeTruthy();

        const res = await request(app)
            .delete("/api/v1/auth/delete-account")
            .set("Cookie", setup.cookie);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "User deleted successfully");
        expect(res.body).toHaveProperty("modifiedArticleCount");
        expect(Number.isInteger(res.body.modifiedArticleCount)).toBe(true);
    });

    it("should fail to process an unauthenticated user's request", async () => {
        const res = await request(app).delete("/api/v1/auth/delete-account");

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "User not authenticated");
    });
});
