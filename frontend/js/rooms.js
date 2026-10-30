// rooms.js
//
// Renders the list of rooms on index.html.
// This file is DONE FOR YOU as a worked example - study how it
// builds HTML from data and reads DOM elements before you write
// booking.js and my-bookings.js yourself.

async function renderRooms() {
  const container = document.getElementById("room-list");
  try {
    const rooms = await getRooms();
    const filter = document.getElementById("capacity-filter");

    if (!rooms || rooms.length === 0) {
      container.innerHTML = "<p>No rooms available.</p>";
      return;
    }

    function renderFilteredRooms() {
      const minimumCapacity = Number(filter.value) || 0;
      const matchingRooms = rooms.filter((room) => room.capacity >= minimumCapacity);

      if (matchingRooms.length === 0) {
        container.innerHTML = "<p class=\"empty-message\">No rooms meet that capacity. Try a lower number.</p>";
        return;
      }
      container.innerHTML = matchingRooms.map(roomToCardHtml).join("");
    }

    filter.addEventListener("input", renderFilteredRooms);
    renderFilteredRooms();
  } catch (error) {
    container.innerHTML = `<p class="status-message error">${escapeRoomHtml(error.message || "Could not load rooms.")}</p>`;
  }
}

function roomToCardHtml(room) {
  const equipmentPills = room.equipment
    .map((item) => `<span class="equip-pill">${escapeRoomHtml(item)}</span>`)
    .join("");

  const foodClass = room.foodAllowed ? "food-yes" : "food-no";
  const foodText = room.foodAllowed ? "Yes" : "No";

  return `
    <div class="room-card">
      <h3>${escapeRoomHtml(room.name)}</h3>
      <p class="capacity">Capacity: ${room.capacity} people</p>
      <div class="equip-list">${equipmentPills}</div>
      <p class="food-line ${foodClass}">Food allowed: ${foodText}</p>
      <a class="book-btn" href="booking.html?roomId=${room.id}">Book this room</a>
    </div>
  `;
}

function escapeRoomHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.addEventListener("DOMContentLoaded", renderRooms);
