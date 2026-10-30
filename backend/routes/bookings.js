// Stage 2: Bookings API
//
// Bookings API endpoints:
//   GET    /api/bookings       -> return the full list of bookings
//   POST   /api/bookings       -> create a new booking, save it to bookings.json
//   PUT    /api/bookings/:id   -> update an existing booking
//   DELETE /api/bookings/:id   -> remove a booking by id
//
// A booking object looks like this:
// {
//   "id": "b1",              // generate with Date.now().toString()
//   "roomId": "r1",
//   "clubName": "Chess Club",
//   "bookedBy": "Alex Cougar",
//   "date": "2026-10-01",
//   "startTime": "14:00",
//   "endTime": "15:00",
//   "purpose": "Weekly meeting"
// }

const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");

function normalizeBooking(body = {}) {
  if (!body || typeof body !== "object") {
    body = {};
  }

  const booking = {
    roomId: String(body.roomId || "").trim(),
    clubName: String(body.clubName || "").trim(),
    bookedBy: String(body.bookedBy || "").trim(),
    date: String(body.date || "").trim(),
    startTime: String(body.startTime || "").trim(),
    endTime: String(body.endTime || "").trim(),
    purpose: String(body.purpose || "").trim(),
  };

  if (
    !booking.roomId ||
    !booking.clubName ||
    !booking.bookedBy ||
    !booking.date ||
    !booking.startTime ||
    !booking.endTime
  ) {
    return { error: "Please include a room, club name, your name, date, start time, and end time." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    return { error: "Please enter a valid date." };
  }
  const parsedDate = new Date(`${booking.date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== booking.date) {
    return { error: "Please enter a valid date." };
  }

  const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!validTime.test(booking.startTime) || !validTime.test(booking.endTime)) {
    return { error: "Please enter valid start and end times." };
  }
  if (booking.endTime <= booking.startTime) {
    return { error: "End time must be after the start time." };
  }

  return { booking };
}

function findConflict(bookings, candidate, ignoredId = null) {
  return bookings.find((existing) => {
    if (
      existing.id === ignoredId ||
      existing.roomId !== candidate.roomId ||
      existing.date !== candidate.date
    ) {
      return false;
    }

    // Treat bookings as half-open intervals: a booking ending at 15:00
    // does not conflict with another one starting at 15:00.
    return candidate.startTime < existing.endTime && candidate.endTime > existing.startTime;
  });
}

function roomExists(roomId) {
  return readData("rooms.json").some((room) => room.id === roomId);
}

function sendConflict(res) {
  return res.status(409).json({
    error: "This room is already booked for an overlapping time on that date.",
  });
}

// GET /api/bookings
router.get("/", (req, res) => {
  const bookings = readData("bookings.json");
  res.json(bookings);
});

// POST /api/bookings
router.post("/", (req, res) => {
  const normalized = normalizeBooking(req.body);
  if (normalized.error) {
    return res.status(400).json({ error: normalized.error });
  }

  const booking = normalized.booking;
  if (!roomExists(booking.roomId)) {
    return res.status(400).json({ error: "Room not found" });
  }

  const bookings = readData("bookings.json");
  if (findConflict(bookings, booking)) {
    return sendConflict(res);
  }

  const newBooking = {
    id: Date.now().toString(),
    ...booking,
  };

  bookings.push(newBooking);
  writeData("bookings.json", bookings);
  res.status(201).json(newBooking);
});

// PUT /api/bookings/:id
router.put("/:id", (req, res) => {
  const bookings = readData("bookings.json");
  const bookingIndex = bookings.findIndex((booking) => booking.id === req.params.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const normalized = normalizeBooking(req.body);
  if (normalized.error) {
    return res.status(400).json({ error: normalized.error });
  }

  const booking = normalized.booking;
  if (!roomExists(booking.roomId)) {
    return res.status(400).json({ error: "Room not found" });
  }
  if (findConflict(bookings, booking, req.params.id)) {
    return sendConflict(res);
  }

  const updatedBooking = { id: req.params.id, ...booking };
  bookings[bookingIndex] = updatedBooking;
  writeData("bookings.json", bookings);
  res.json(updatedBooking);
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
