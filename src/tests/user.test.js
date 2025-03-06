const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user.model");

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Authentication", () => {
  afterEach(async () => {
    // Cleanup test users after each test
    await User.deleteMany({});
  });

  it("should register a user", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered");
  });

  it("should not register a user with missing fields", async () => {
    const res = await request(app).post("/api/users/register").send({
      email: "test@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("should login a user and return JWT token", async () => {
    // First, register a user
    await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    // Then, log in
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined(); // Ensure token is returned
  });

  it("should not login with wrong credentials", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
