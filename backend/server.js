// Stage 2 / Stage 3: Express server
//
// This file is mostly done for you. It:
//   1. Serves the frontend (HTML/CSS/JS) as static files
//   2. Mounts the API routes for rooms and bookings
//
// You should not need to change much here in Stage 2 - focus on
// routes/rooms.js and routes/bookings.js. In Stage 3, use this
// running server to test your frontend's fetch() calls.

const express = require("express");
const path = require("path");

const roomsRouter = require("./routes/rooms");
const bookingsRouter = require("./routes/bookings");

const app = express();
const PORT = 3000;

// Allow Express to read JSON request bodies (needed for POST /api/bookings)
app.use(express.json());

// Serve the frontend folder as static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// API routes
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
