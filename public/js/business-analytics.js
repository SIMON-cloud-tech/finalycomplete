document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");

  async function loadAnalytics() {
    try {
      const response = await fetch('/api/analytics-summary');
      const data = await response.json();

      // Build table
      let table = `
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Amount (KES)</th>
              <th>Commission (KES)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(item => {
        table += `
          <tr>
            <td>${item.landlord}</td>
            <td>${item.amount}</td>
            <td>${item.commission}</td>
          </tr>
        `;
      });

      table += `</tbody></table>`;

      // Inject table and chart canvases
      contentArea.innerHTML = table + `
        <canvas id="commissionChart"></canvas>
        <canvas id="scatterChart"></canvas>
      `;

      // Prepare chart data
      const landlords = data.map(d => d.landlord);
      const commissions = data.map(d => d.commission);

      // Bar chart: commissions vs landlords
      new Chart(document.getElementById("commissionChart"), {
        type: 'bar',
        data: {
          labels: landlords,
          datasets: [{
            label: 'Commission (KES)',
            data: commissions,
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Commissions vs Landlords'
            }
          }
        }
      });

      // Scatter plot: amount vs commission
      const scatterData = data.map(d => ({
        x: d.amount,
        y: d.commission,
        landlord: d.landlord
      }));

      new Chart(document.getElementById("scatterChart"), {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Amount vs Commission',
            data: scatterData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const point = context.raw;
                  return `${point.landlord}: Amount ${point.x}, Commission ${point.y}`;
                }
              }
            },
            title: {
              display: true,
              text: 'Scatter Plot: Amount vs Commission'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Amount (KES)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Commission (KES)'
              }
            }
          }
        }
      });

    } catch (err) {
      console.error("Error loading analytics:", err);
      contentArea.innerHTML = "<p>Failed to load analytics.</p>";
    }
  }

  // Load when Analytics sidebar item is clicked
  document.querySelector('[data-content="Analytics"]').addEventListener("click", loadAnalytics);
});
