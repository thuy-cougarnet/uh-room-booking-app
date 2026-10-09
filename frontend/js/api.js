// api.js
//
// This file is the ONLY place that talks to the backend.
// rooms.js / booking.js / my-bookings.js all call the functions below -
// they never use fetch() directly. This keeps things organized and
// makes Stage 3 (integration) simple: you only edit this one file.
//
// STAGE 1 (Frontend only, no backend yet):
//   Leave this file as-is. The functions below return hardcoded
//   "mock" data so you can build and style your pages first.
//
// STAGE 3 (Integration):
//   Replace the body of each function with a real fetch() call to
//   your Express server, started with "npm start" at http://localhost:3000.
//   Examples are shown in the comments below each function.

// ---------- Mock data used only in Stage 1 ----------
const MOCK_ROOMS = [
  {
    id: "r1",
    name: "Bayou City Room",
    capacity: 12,
    equipment: ["Projector", "Whiteboard", "Conference Phone"],
    foodAllowed: true,
  },
  {
    id: "r2",
    name: "Cullen Room",
    capacity: 8,
    equipment: ["TV Screen", "Whiteboard"],
    foodAllowed: false,
  },
];

let MOCK_BOOKINGS = [];

// ---------- Rooms ----------

async function getRooms() {
  const response = await fetch("/api/rooms");
  if (!response.ok) {
    throw new Error("Could not load rooms.");
  }
  return await response.json();
}

async function getRoomById(id) {
  const response = await fetch(`/api/rooms/${id}`);
  if (!response.ok) {
    throw new Error("Could not load that room.");
  }
  return await response.json();
}

// ---------- Bookings ----------

async function getBookings() {
  const response = await fetch("/api/bookings");
  if (!response.ok) {
    throw new Error("Could not load bookings.");
  }
  return await response.json();
}

async function createBooking(bookingData) {
  // bookingData looks like:
  // { roomId, clubName, date, startTime, endTime, purpose }
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not save the booking.");
  }
  return data;
}

async function deleteBooking(id) {
  const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not cancel the booking.");
  }
  return data;
}
