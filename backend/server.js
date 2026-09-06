const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const foundResponseRoutes = require("./routes/foundResponseRoutes");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use((req, res, next) => {
  const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (!unsafeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;

  if (origin && origin != "http://localhost:5173") {
    return res.status(403).json({
      message: "Request origin is not allowed",
    });
  }
  next();
});
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    message: "LostLink API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/found-responses", foundResponseRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
