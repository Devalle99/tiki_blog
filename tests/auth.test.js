const request = require("supertest");
const app = require("../src/app");
const { clear, createTestUser } = require("./mainSetup");

afterEach(async () => {
    await clear();
});

describe("Signup", () => {
    it("should signup a user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ username: "username", password: "password" });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("message", "User created successfully");
    });

    it("should fail to signup without both a password and a username", async () => {
        const res = await request(app).post("/api/v1/auth/signup").send({});

        expect(res.statusCode).toEqual(500);
    });
});

describe("Login", () => {
    beforeEach(async () => {
        await createTestUser();
    });

    it("should login a user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "testUser", password: "password" });

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
        await createTestUser();

        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "testUser", password: "password" });

        expect(loginResponse.statusCode).toEqual(200);

        const cookie = loginResponse.headers["set-cookie"];

        const logoutResponse = await request(app)
            .post("/api/v1/auth/logout")
            .set("Cookie", cookie);

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
        await createTestUser();

        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "testUser", password: "password" });

        expect(loginResponse.statusCode).toEqual(200);

        const cookie = loginResponse.headers["set-cookie"];

        const res = await request(app)
            .delete("/api/v1/auth/delete-account")
            .set("Cookie", cookie);

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
