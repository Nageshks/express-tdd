const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Task = require("../models/task.model");
const User = require("../models/user.model");

let token;

beforeAll(async () => {
  const userRes = await request(app).post("/api/users/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  const loginRes = await request(app).post("/api/users/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = loginRes.body.token;
});

afterEach(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Task Management", () => {
  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Task" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("task");
    expect(res.body.task).toHaveProperty("title", "Test Task");
  });

  it("should get all tasks", async () => {
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1" });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it("should update a task", async () => {
    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task to Update" });

    const taskId = taskRes.body.task._id; // Use nested task object

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task", completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("task");
    expect(res.body.task).toHaveProperty("title", "Updated Task");
    expect(res.body.task).toHaveProperty("completed", true);
  });

  it("should delete a task", async () => {
    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task to Delete" });

    const taskId = taskRes.body.task._id; // Use nested task object

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Task deleted successfully");
    expect(res.body).toHaveProperty("task"); // Ensure deleted task is returned
  });

  it("should not create a task without a title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Title is required");
  });
});
