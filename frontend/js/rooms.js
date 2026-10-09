// rooms.js
//
// Renders the list of rooms on index.html.
// This file is DONE FOR YOU as a worked example - study how it
// builds HTML from data and reads DOM elements before you write
// booking.js and my-bookings.js yourself.

async function renderRooms() {
  const container = document.getElementById("room-list");
  const rooms = await getRooms();

  if (!rooms || rooms.length === 0) {
    container.innerHTML = "<p>No rooms available.</p>";
    return;
  }

  container.innerHTML = rooms.map(roomToCardHtml).join("");
}

function roomToCardHtml(room) {
  const equipmentPills = room.equipment
    .map((item) => `<span class="equip-pill">${item}</span>`)
    .join("");

  const foodClass = room.foodAllowed ? "food-yes" : "food-no";
  const foodText = room.foodAllowed ? "Yes" : "No";

  return `
    <div class="room-card">
      <h3>${room.name}</h3>
      <p class="capacity">Capacity: ${room.capacity} people</p>
      <div class="equip-list">${equipmentPills}</div>
      <p class="food-line ${foodClass}">Food allowed: ${foodText}</p>
      <a class="book-btn" href="booking.html?roomId=${room.id}">Book this room</a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderRooms);
