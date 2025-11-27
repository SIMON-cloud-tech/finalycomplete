// public/js/business-analytics.js
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const analyticsItem = document.querySelector('li[data-content="Analytics"]');

  analyticsItem.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();

      // Build table dynamically
      let tableHTML = `
        <h2>Analytics</h2>
        <table>
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Amount (KSh)</th>
              <th>Commission (KSh)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(item => {
        tableHTML += `
          <tr>
            <td>${item.landlord}</td>
            <td>${item.amount}</td>
            <td>${item.commission}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>
        <canvas id="barChart" width="400" height="200"></canvas>
        <canvas id="lineChart" width="400" height="200"></canvas>
      `;
      contentArea.innerHTML = tableHTML;

      // Prepare chart data
      const landlords = data.map(d => d.landlord);
      const commissions = data.map(d => d.commission);
      const amounts = data.map(d => d.amount);

      // Bar chart: most profitable landlord by commission
      new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
          labels: landlords,
          datasets: [{
            label: "Commission (KSh)",
            data: commissions,
            backgroundColor: "rgba(37, 102, 163, 0.8)"
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Most Profitable Landlords (Commission)"
            }
          }
        }
      });

      // Line chart: performance trend (amount vs commission)
      new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
          labels: landlords,
          datasets: [
            {
              label: "Amount (KSh)",
              data: amounts,
              borderColor: "rgba(2, 130, 250, 0.8)",
              fill: false
            },
            {
              label: "Commission (KSh)",
              data: commissions,
              borderColor: "rgba(6, 146, 92, 0.8)",
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Performance: Amount vs Commission"
            }
          }
        }
      });

    } catch (err) {
      contentArea.innerHTML = `<p>Error loading analytics: ${err.message}</p>`;
    }
  });
});
