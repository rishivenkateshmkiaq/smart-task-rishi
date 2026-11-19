
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const proxy = require("express-http-proxy");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "API Gateway",
    status: "Running",
  });
});

// Auth Service
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return "/api/auth" + req.url;
    },
  })
);

// Task Service
app.use(
  "/api/tasks",
  proxy(process.env.TASK_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return "/api/tasks" + req.url;
    },
  })
);

// Export app at the end
module.exports = app;

