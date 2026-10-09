// Stage 2: Bookings API
//
// Endpoints to implement in this file:
//   GET    /api/bookings       -> return the full list of bookings
//   POST   /api/bookings       -> create a new booking, save it to bookings.json
//   DELETE /api/bookings/:id   -> remove a booking by id
//
// A booking object looks like this:
// {
//   "id": "b1",              // generate with Date.now().toString()
//   "roomId": "r1",
//   "clubName": "Chess Club",
//   "date": "2026-10-01",
//   "startTime": "14:00",
//   "endTime": "15:00",
//   "purpose": "Weekly meeting"
// }

const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");

// GET /api/bookings
router.get("/", (req, res) => {
  const bookings = readData("bookings.json");
  res.json(bookings);
});

// POST /api/bookings
router.post("/", (req, res) => {
  const { roomId, clubName, date, startTime, endTime, purpose } = req.body;

  if (!roomId || !clubName || !date || !startTime || !endTime) {
    return res.status(400).json({
      error: "Please include a room, club name, date, start time, and end time.",
    });
  }

  const rooms = readData("rooms.json");
  const room = rooms.find((item) => item.id === roomId);
  if (!room) {
    return res.status(400).json({ error: "Room not found" });
  }

  const bookings = readData("bookings.json");
  const newBooking = {
    id: Date.now().toString(),
    roomId,
    clubName: String(clubName).trim(),
    date,
    startTime,
    endTime,
    purpose: purpose ? String(purpose).trim() : "",
  };

  bookings.push(newBooking);
  writeData("bookings.json", bookings);
  res.status(201).json(newBooking);
});

// DELETE /api/bookings/:id
router.delete("/:id", (req, res) => {
  const bookings = readData("bookings.json");
  const filtered = bookings.filter((booking) => booking.id !== req.params.id);

  if (filtered.length === bookings.length) {
    return res.status(404).json({ error: "Booking not found" });
  }

  writeData("bookings.json", filtered);
  res.status(200).json({ message: "Booking canceled" });
});

module.exports = router;
