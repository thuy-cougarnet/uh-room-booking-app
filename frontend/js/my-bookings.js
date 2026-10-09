// my-bookings.js
//
// Renders the list of bookings on my-bookings.html and lets the
// user cancel a booking. Use rooms.js as your reference.

async function renderBookings() {
  const container = document.getElementById("bookings-list");

  try {
    const bookings = await getBookings();
    const rooms = await getRooms();

    if (!bookings || bookings.length === 0) {
      container.innerHTML = `<p class="empty-message">You don't have any bookings yet. <a href="booking.html">Book a room</a> to reserve one.</p>`;
      return;
    }

    const sorted = bookings.slice().sort((a, b) => {
      return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
    });

    container.innerHTML = sorted.map((booking) => bookingToHtml(booking, rooms)).join("");

    container.querySelectorAll("button[data-id]").forEach((button) => {
      button.addEventListener("click", () => {
        handleCancelClick(button.getAttribute("data-id"));
      });
    });
  } catch (error) {
    container.innerHTML = `<p class="status-message error">${error.message || "Could not load bookings."}</p>`;
  }
}

function bookingToHtml(booking, rooms) {
  const room = rooms.find((item) => item.id === booking.roomId);
  const roomName = room ? room.name : booking.roomId;
  const purpose = booking.purpose ? escapeHtml(booking.purpose) : "—";

  return `
    <div class="booking-item">
      <div>
        <h3>${escapeHtml(roomName)}</h3>
        <p><strong>Club:</strong> ${escapeHtml(booking.clubName)}</p>
        <p><strong>Date:</strong> ${escapeHtml(booking.date)} · ${escapeHtml(booking.startTime)} - ${escapeHtml(booking.endTime)}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
      </div>
      <button type="button" data-id="${escapeHtml(booking.id)}">Cancel</button>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function handleCancelClick(bookingId) {
  try {
    await deleteBooking(bookingId);
    await renderBookings();
  } catch (error) {
    const container = document.getElementById("bookings-list");
    const note = document.createElement("p");
    note.className = "status-message error";
    note.textContent = error.message || "Could not cancel that booking.";
    container.prepend(note);
  }
}

document.addEventListener("DOMContentLoaded", renderBookings);
