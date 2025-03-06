const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../swagger.json"), "utf8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/users", require("./routes/user.routes.js"));
app.use("/api/tasks", require("./routes/task.routes.js"));

module.exports = app;
