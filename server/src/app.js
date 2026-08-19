const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
