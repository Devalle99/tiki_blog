const request = require("supertest");
const app = require("../src/app");
const { clearDB, generateSetup } = require("./setup/mainSetup");

afterEach(async () => {
    await clearDB();
});

describe("List articles", () => {
    // before: create user, sign in, create many articles
    it("should list all existing articles successfully");
});

describe("Get article by Id", () => {
    // before: create user, sign in, create an article, get article id
    it("should retrieve an article successfully");
});

describe("Create an article", () => {
    // before: create user, sign in
    it("should create an article successfully");
});

describe("Update an article", () => {
    // before: create user, sign in, create an article, get article id
    it("should update an article successfully");
});

describe("Delete an article", () => {
    // before: create user, sign in, create an article, get article id
    it("should delete an article successfully");
});
