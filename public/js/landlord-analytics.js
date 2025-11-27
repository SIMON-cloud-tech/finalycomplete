document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const analyticsItem = document.querySelector('li[data-content="Analytics"]');

  analyticsItem.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("landlordToken");
      if (!token) {
        contentArea.innerHTML = "<p>Please log in to view analytics.</p>";
        return;
      }

      const res = await fetch("/api/landlord/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        contentArea.innerHTML = `<p>Error: ${data.message}</p>`;
        return;
      }

      // Build table
      let tableHTML = `
        <h2>Analytics</h2>
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Commission (KES)</th>
              <th>Revenue (KES)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.sales.forEach(s => {
        tableHTML += `
          <tr>
            <td>${s.client}</td>
            <td>${s.commission}</td>
            <td>${s.revenue}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table><canvas id="analyticsChart"></canvas>`;
      contentArea.innerHTML = tableHTML;

      // Chart.js curve
      const ctx = document.getElementById("analyticsChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.sales.map(s => s.client),
          datasets: [
            {
              label: "Commission",
              data: data.sales.map(s => s.commission),
              borderColor: "red",
              fill: false,
              tension: 0.4 // makes it a curve
            },
            {
              label: "Revenue",
              data: data.sales.map(s => s.revenue),
              borderColor: "green",
              fill: false,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Commissions vs Revenue"
            }
          }
        }
      });
    } catch (err) {
      console.error("🚨 Error loading analytics:", err);
      contentArea.innerHTML = `<p>Error loading analytics: ${err.message}</p>`;
    }
  });
});
