
/* =========================
   ROLE USER
========================= */
let roleUser = localStorage.getItem("roleUser") || "siswa";

function loginAdmin() {
  const password = prompt("Masukkan password admin:");
  if (password === "admin123") {
    roleUser = "admin";
    localStorage.setItem("roleUser", "admin");
    alert("Login admin berhasil");
    renderSampah();
    updateAdminUI();
  } else {
    alert("Password salah!");
  }
}

function logoutAdmin() {
  roleUser = "siswa";
  localStorage.setItem("roleUser", "siswa");
  alert("Logout berhasil");
  renderSampah();
  updateAdminUI();
}

function updateAdminUI() {
  const loginBtn = document.querySelector("button[onclick='loginAdmin()']");
  const logoutBtn = document.querySelector("button[onclick='logoutAdmin()']");

  if (!loginBtn || !logoutBtn) return;

  loginBtn.style.display = roleUser === "admin" ? "none" : "inline-block";
  logoutBtn.style.display = roleUser === "admin" ? "inline-block" : "none";
}

/* =========================
   KONFIGURASI SAMPAH
========================= */
const wasteConfig = {
  organik:   { label: "Organik",   color: "#74c69d" },
  anorganik:{ label: "Anorganik", color: "#f4a261" },
  b3:        { label: "B3",        color: "#e63946" },
  kertas:    { label: "Kertas",    color: "#457b9d" },
  residu:    { label: "Residu",    color: "#6c757d" }
};

let dataSampah = {};
Object.keys(wasteConfig).forEach(k => dataSampah[k] = 0);

/* =========================
   HISTORI
========================= */
let historiSampah = [];

function renderHistori() {
  const body = document.getElementById("historiBody");
  if (!body) return;

  body.innerHTML = "";
  historiSampah.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.waktu}</td>
      <td>${item.jenis.toUpperCase()}</td>
      <td class="${item.jumlah >= 0 ? 'plus' : 'minus'}">
        ${item.jumlah > 0 ? '+' : ''}${item.jumlah} kg
      </td>
    `;
    body.appendChild(tr);
  });
}

/* =========================
   RENDER SAMPAH
========================= */
function renderSampah() {
  Object.keys(wasteConfig).forEach(jenis => {
    const countEl = document.getElementById(`${jenis}Count`);
    const inputEl = document.getElementById(`input-${jenis}`);
    const btn = inputEl?.nextElementSibling;

    if (countEl) {
      countEl.textContent = dataSampah[jenis].toFixed(1) + " kg";
    }

    const disabled = roleUser !== "admin";
    if (inputEl) inputEl.disabled = disabled;
    if (btn) btn.disabled = disabled;
  });
}

/* =========================
   KONFIRMASI TAMBAH / KURANG
========================= */
function konfirmasiSampah(jenis) {
  if (roleUser !== "admin") {
    alert("Hanya admin yang bisa mengubah data!");
    return;
  }

  const input = document.getElementById(`input-${jenis}`);
  const nilai = parseFloat(input.value);

  if (isNaN(nilai)) return alert("Masukkan jumlah!");

  const totalBaru = dataSampah[jenis] + nilai;
  if (totalBaru < 0) return alert("Jumlah tidak boleh negatif!");

  dataSampah[jenis] = totalBaru;

  historiSampah.unshift({
    jenis,
    jumlah: nilai,
    waktu: new Date().toLocaleString("id-ID")
  });

  simpanKeLocal();
  simpanHistori();
  renderSampah();
  renderHistori();
  updateChart();

  input.value = "";
}

/* =========================
   LOCAL STORAGE
========================= */
function simpanKeLocal() {
  localStorage.setItem("dataSampah", JSON.stringify(dataSampah));
}

function simpanHistori() {
  localStorage.setItem("historiSampah", JSON.stringify(historiSampah));
}

function ambilDariLocal() {
  const data = localStorage.getItem("dataSampah");
  if (data) dataSampah = JSON.parse(data);
}

function ambilHistori() {
  const data = localStorage.getItem("historiSampah");
  if (data) historiSampah = JSON.parse(data);
}

/* =========================
   CHART
========================= */
let wasteChart;

function initChart() {
  const ctx = document.getElementById("wasteChart");
  if (!ctx) return;

  wasteChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.values(wasteConfig).map(w => w.label),
      datasets: [{
        label: "Jumlah Sampah (kg)",
        data: Object.keys(wasteConfig).map(k => dataSampah[k]),
        backgroundColor: Object.values(wasteConfig).map(w => w.color),
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateChart() {
  if (!wasteChart) return;
  wasteChart.data.datasets[0].data =
    Object.keys(wasteConfig).map(k => dataSampah[k]);
  wasteChart.update();
}

/* =========================
   INIT SAAT LOAD
========================= */
document.addEventListener("DOMContentLoaded", () => {
  ambilDariLocal();
  ambilHistori();
  renderSampah();
  renderHistori();
  updateAdminUI();
  initChart();
});

function trackAction(actionName) {
  if (typeof gtag === "function") {
    gtag('event', actionName, {
      event_category: 'Waste Action',
      event_label: 'EcoBel’s'
    });
  }
}

