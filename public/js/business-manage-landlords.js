document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const manageItem = document.querySelector('li[data-content="ManageLandlords"]');

  manageItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/manage-landlords");
      const landlords = await res.json();

      let tableHTML = `
        <h2>Manage Landlords</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Landlord ID</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      landlords.forEach(ld => {
        tableHTML += `
          <tr>
            <td>${ld.name}</td>
            <td>${ld.id}</td>
            <td>${ld.email}</td>
            <td>${ld.blocked ? "Blocked" : "Active"}</td>
            <td class="actions">
              <button class="delete-btn" data-id="${ld.id}">Block</button>
              <button class="warn-btn" data-id="${ld.id}">Send Warning</button>
            </td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      contentArea.innerHTML = tableHTML;

      // Attach event listeners
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
          const id = e.target.dataset.id;
          const res = await fetch(`/api/manage-landlords/${id}`, { method: "DELETE" });
          const msg = await res.json();
          alert(msg.message);
        });
      });

      document.querySelectorAll(".warn-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
          const id = e.target.dataset.id;
          const res = await fetch(`/api/manage-landlords/${id}/warning`, { method: "POST" });
          const msg = await res.json();
          alert(msg.message);
        });
      });

    } catch (err) {
      contentArea.innerHTML = `<p>Error loading landlords: ${err.message}</p>`;
    }
  });
});
