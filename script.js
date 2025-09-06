let mealsChartInstance, co2ChartInstance;

const chartData = {
    '12m': {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        meals: [500,1200,2000,3100,4500,6000,8000,9500,11000,12300,13200,14000],
        co2: [200,300,450,600,800,1000,1300,1500,1700,1850,1950,2000],
    },
    '6m': {
        labels: ["Jul","Aug","Sep","Oct","Nov","Dec"],
        meals: [8000,9500,11000,12300,13200,14000],
        co2: [1300,1500,1700,1850,1950,2000],
    },
    '30d': {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        meals: [3050, 3200, 2900, 3450],
        co2: [450, 480, 440, 510],
    }
};

function updateAllCharts(range) {
    const data = chartData[range];
    mealsChartInstance.data.labels = data.labels;
    mealsChartInstance.data.datasets[0].data = data.meals;
    co2ChartInstance.data.labels = data.labels;
    co2ChartInstance.data.datasets[0].data = data.co2;
    mealsChartInstance.update();
    co2ChartInstance.update();
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Single entry point for all DOM-ready initializations ---

  // 1. Set active navigation link based on current URL
  const navLinks = document.querySelectorAll('.nav-item');
  const currentPath = location.pathname;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath)) {
      // Remove 'active' from any other link that might have it by default
      document.querySelector('.nav-item.active')?.classList.remove('active');
      link.classList.add('active');
    }
  });

  console.log('Homepage pixel-approx loaded — accent:', getComputedStyle(document.documentElement).getPropertyValue('--accent'));

  // 2. Donation form submission
  const form = document.getElementById('donationForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log("Donation submitted:", Object.fromEntries(formData));
      alert("Donation submitted successfully! (Demo — backend not connected yet)");
      form.reset();
    });
  }

  // 3. Volunteer form submission
  const vForm = document.getElementById('volunteerForm');
  if (vForm) {
    vForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(vForm);
      console.log("Volunteer application:", Object.fromEntries(data));
      alert("Volunteer application submitted! (Demo — backend not connected yet)");
      vForm.reset();
    });
  }

  // 4. QR Code Scanner Logic for Volunteer Page
  const startBtn = document.getElementById("startBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const scanResult = document.getElementById("scanResult");
  const scannerBox = document.getElementById("scannerBox");
  const placeholder = document.getElementById("scannerPlaceholder");

  // Only initialize scanner logic if the buttons are on the page
  if (startBtn && confirmBtn && scannerBox) {
    let html5QrCode;

    startBtn.addEventListener("click", () => {
      placeholder.classList.add("hidden");
      scannerBox.classList.remove("hidden");

      html5QrCode = new Html5Qrcode("preview");

      html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: 250 },
        (decodedText) => { // Success callback
          scanResult.textContent = "Scanned: " + decodedText;
          confirmBtn.disabled = false;
          // Optional: stop scanning after a successful scan
          // html5QrCode.stop();
        },
        (error) => { // Failure callback
          // This callback is called frequently, so we'll ignore non-critical errors.
        }
      ).catch(err => {
        console.error("Unable to start QR Code scanner.", err);
        alert("Error: Could not start the camera. Please check permissions.");
      });
    });

    confirmBtn.addEventListener("click", () => {
      alert("Pickup confirmed ✅\n" + scanResult.textContent);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          scannerBox.classList.add("hidden");
          placeholder.classList.remove("hidden");
          confirmBtn.disabled = true;
          scanResult.textContent = "Waiting for scan...";
        }).catch(err => {
          console.error("Failed to stop the scanner.", err);
        });
      }
    });
  }

  // 5. Initialize Charts for Analytics Page
  initializeCharts();

  // 6. Add event listener for the analytics time range selector
  const timeRangeSelect = document.getElementById('timeRangeSelect');
  if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => {
          updateAllCharts(e.target.value);
      });
  }
});

// --- Event Delegation for dynamically added elements or general purpose clicks ---
document.addEventListener('click', (e) => {
  // Handle pickup button clicks on the donations page
  if (e.target.matches('.pickup-btn')) {
    const id = e.target.getAttribute('data-id');
    // TODO: call your backend reservation API here
    alert(`Pickup reserved (demo) for item #${id}`);
  }
});

function initializeCharts() {
// Meals Saved Over Time (Line Chart)
const ctxMeals = document.getElementById('mealsChart');
const initialData = chartData['12m'];
if (ctxMeals) {
  mealsChartInstance = new Chart(ctxMeals, {
    type: 'line',
    data: {
      labels: initialData.labels,
      datasets: [{
        label: "Meals Saved",
        data: initialData.meals,
        borderColor: "green",
        backgroundColor: "rgba(46,125,50,0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// CO2 Reduction (Bar Chart)
const ctxCO2 = document.getElementById('co2Chart');
if (ctxCO2) {
  co2ChartInstance = new Chart(ctxCO2, {
    type: 'bar',
    data: {
      labels: initialData.labels,
      datasets: [{
        label: "CO₂ Reduced (kg)",
        data: initialData.co2,
        backgroundColor: "black"
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// Donation Status (Doughnut)
const ctxDonation = document.getElementById('donationStatusChart');
if (ctxDonation) {
  new Chart(ctxDonation, {
    type: 'doughnut',
    data: {
      labels: ["Active","Completed","Expired"],
      datasets: [{
        data: [60,30,10],
        backgroundColor: ["#2e7d32","#4caf50","#a5d6a7"]
      }]
    },
    options: {
      responsive: true,
      // By removing `maintainAspectRatio: false`, it defaults to `true`,
      // which is ideal for pie/doughnut charts to prevent distortion.
      plugins: {
        legend: { position: 'bottom' } // Move legend to the bottom for better layout
      }
    }
  });
}
}
  // 7. Rewards page redeem buttons
  const redeemButtons = document.querySelectorAll('.reward-card .btn');
  redeemButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert("Reward redeemed successfully! (Demo — backend not connected yet)");
    });
  });
  // 7. Rewards page logic
  const balanceValue = document.querySelector('.balance-value');
  const rewardButtons = document.querySelectorAll('.reward-card .btn');

  if (balanceValue && rewardButtons.length) {
    // Initialize balance from localStorage or default to 2450
    let balance = parseInt(localStorage.getItem('rewardBalance')) || 2450;
    balanceValue.textContent = balance + " pts";

    rewardButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Extract points cost from button text
        const costMatch = btn.textContent.match(/(\d+)\s*pts/);
        if (!costMatch) return;

        const cost = parseInt(costMatch[1]);

        if (balance >= cost) {
          balance -= cost;
          balanceValue.textContent = balance + " pts";
          localStorage.setItem('rewardBalance', balance);
          alert("✅ Reward redeemed! " + cost + " pts deducted.");
        } else {
          alert("❌ Not enough points to redeem this reward.");
        }
      });
    });
  }
