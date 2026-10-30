// Renders bookings and lets the user edit or cancel each one.

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

    container.querySelectorAll(".cancel-booking-button").forEach((button) => {
      button.addEventListener("click", () => handleCancelClick(button.dataset.id));
    });

    container.querySelectorAll(".edit-booking-button").forEach((button) => {
      button.addEventListener("click", () => {
        const form = button.closest(".booking-item").querySelector(".edit-booking-form");
        form.hidden = !form.hidden;
        button.setAttribute("aria-expanded", String(!form.hidden));
      });
    });

    container.querySelectorAll(".edit-booking-form").forEach((form) => {
      form.addEventListener("submit", handleEditSubmit);
      form.querySelector(".close-edit-button").addEventListener("click", () => {
        form.hidden = true;
        const editButton = form.closest(".booking-item").querySelector(".edit-booking-button");
        editButton.setAttribute("aria-expanded", "false");
      });
    });
  } catch (error) {
    container.innerHTML = `<p class="status-message error">${escapeHtml(error.message || "Could not load bookings.")}</p>`;
  }
}

function bookingToHtml(booking, rooms) {
  const room = rooms.find((item) => item.id === booking.roomId);
  const roomName = room ? room.name : booking.roomId;
  const purpose = booking.purpose ? escapeHtml(booking.purpose) : "—";
  const bookedBy = booking.bookedBy ? escapeHtml(booking.bookedBy) : "Not provided";
  const roomOptions = rooms.map((item) => `
    <option value="${escapeHtml(item.id)}" ${item.id === booking.roomId ? "selected" : ""}>
      ${escapeHtml(item.name)} (${item.capacity} people)
    </option>
  `).join("");

  return `
    <article class="booking-item">
      <div class="booking-summary">
        <h3>${escapeHtml(roomName)}</h3>
        <p><strong>Club:</strong> ${escapeHtml(booking.clubName)}</p>
        <p><strong>Booked by:</strong> ${bookedBy}</p>
        <p><strong>Date:</strong> ${escapeHtml(booking.date)} · ${escapeHtml(booking.startTime)} - ${escapeHtml(booking.endTime)}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
      </div>
      <div class="booking-actions">
        <button type="button" class="edit-booking-button" data-id="${escapeHtml(booking.id)}" aria-expanded="false">Edit</button>
        <button type="button" class="cancel-booking-button" data-id="${escapeHtml(booking.id)}">Cancel</button>
      </div>
      <form class="edit-booking-form" data-id="${escapeHtml(booking.id)}" hidden>
        <div class="edit-form-grid">
          <label>Room<select name="roomId" required>${roomOptions}</select></label>
          <label>Club / Organization<input name="clubName" type="text" value="${escapeHtml(booking.clubName)}" required /></label>
          <label>Your Name<input name="bookedBy" type="text" value="${escapeHtml(booking.bookedBy || "")}" required /></label>
          <label>Date<input name="date" type="date" value="${escapeHtml(booking.date)}" required /></label>
          <label>Start Time<input name="startTime" type="time" value="${escapeHtml(booking.startTime)}" required /></label>
          <label>End Time<input name="endTime" type="time" value="${escapeHtml(booking.endTime)}" required /></label>
          <label class="purpose-field">Purpose<textarea name="purpose" rows="2">${escapeHtml(booking.purpose || "")}</textarea></label>
        </div>
        <p class="edit-status status-message" aria-live="polite"></p>
        <div class="edit-form-actions">
          <button type="submit">Save Changes</button>
          <button type="button" class="close-edit-button">Close</button>
        </div>
      </form>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function handleEditSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector(".edit-status");
  status.textContent = "";
  status.className = "edit-status status-message";

  const formData = new FormData(form);
  const bookingData = Object.fromEntries(formData.entries());
  bookingData.clubName = bookingData.clubName.trim();
  bookingData.bookedBy = bookingData.bookedBy.trim();
  bookingData.purpose = bookingData.purpose.trim();

  if (bookingData.endTime <= bookingData.startTime) {
    status.textContent = "End time must be after the start time.";
    status.classList.add("error");
    return;
  }

  try {
    await updateBooking(form.dataset.id, bookingData);
    await renderBookings();
  } catch (error) {
    status.textContent = error.message || "Could not update the booking.";
    status.classList.add("error");
  }
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
