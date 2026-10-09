// booking.js
//
// Handles the "Book a Room" form on booking.html.
// Use rooms.js as your reference for how to fetch data and build
// HTML with template strings.

async function populateRoomSelect() {
  const select = document.getElementById("room-select");
  const rooms = await getRooms();

  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.id;
    option.textContent = `${room.name} (${room.capacity} people)`;
    select.appendChild(option);
  });

  const requestedId = new URLSearchParams(window.location.search).get("roomId");
  if (requestedId && rooms.some((room) => room.id === requestedId)) {
    select.value = requestedId;
  }

  select.addEventListener("change", () => showRoomDetails(rooms));
  showRoomDetails(rooms);
}

function showRoomDetails(rooms) {
  const panel = document.getElementById("room-details");
  if (!panel) {
    return;
  }

  const selectedId = document.getElementById("room-select").value;
  const room = rooms.find((item) => item.id === selectedId);

  if (!room) {
    panel.innerHTML = `<p class="details-placeholder">Choose a room to see capacity, equipment, and the food policy.</p>`;
    return;
  }

  const foodLabel = room.foodAllowed ? "Yes" : "No";
  panel.innerHTML = `
    <h2>${room.name}</h2>
    <p><strong>Capacity:</strong> ${room.capacity} people</p>
    <p><strong>Equipment:</strong> ${room.equipment.join(", ")}</p>
    <p><strong>Food allowed:</strong> ${foodLabel}</p>
  `;
}

async function handleBookingSubmit(event) {
  event.preventDefault();

  const statusEl = document.getElementById("form-status");
  statusEl.className = "status-message";

  const bookingData = {
    roomId: document.getElementById("room-select").value,
    clubName: document.getElementById("club-name").value.trim(),
    date: document.getElementById("date").value,
    startTime: document.getElementById("start-time").value,
    endTime: document.getElementById("end-time").value,
    purpose: document.getElementById("purpose").value.trim(),
  };

  if (bookingData.endTime <= bookingData.startTime) {
    statusEl.textContent = "End time must be after the start time.";
    statusEl.classList.add("error");
    return;
  }

  try {
    await createBooking(bookingData);
    statusEl.textContent = "Booking saved. View it on My Bookings.";
    statusEl.classList.add("success");
    event.target.reset();
    document.getElementById("room-select").dispatchEvent(new Event("change"));
  } catch (error) {
    statusEl.textContent = error.message || "Could not save the booking.";
    statusEl.classList.add("error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateRoomSelect();
  document
    .getElementById("booking-form")
    .addEventListener("submit", handleBookingSubmit);
});
