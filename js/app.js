window.addEventListener("load", function(){

    const splash = document.getElementById("splash");
    const logo = document.getElementById("splashLogo");

    setTimeout(()=>{

        logo.classList.add("fly");

    },2500);

    setTimeout(()=>{

        splash.classList.add("hide");

    },3200);

    setTimeout(()=>{

        splash.style.display="none";

    },4200);

});
/* =========================
   PAGE NAVIGATION SYSTEM
========================= */

document.addEventListener("DOMContentLoaded", function () {

  const navLinks = document.querySelectorAll(".nav-link");

  function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
      page.classList.remove("active");
    });

    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add("active");
      animatePage(pageId);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", function () {
      const pageId = this.getAttribute("data-page");
      if (!pageId) return;

      document.querySelectorAll(".nav-menu .nav-link")
        .forEach(l => l.classList.remove("active"));

      const menuLink = document.querySelector(
        `.nav-menu .nav-link[data-page="${pageId}"]`
      );
      if (menuLink) menuLink.classList.add("active");

      showPage(pageId);
    });
  });

  showPage("beranda");

  ambilDariLocal();
  ambilHistori();
  renderSampah();
  renderHistori();
  updateAdminUI();
  initChart();
  updateStats();
  renderRanking();
})

;


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
   HAMBURGER MENU
========================= */

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger?.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});


/* =========================
   KONFIGURASI SAMPAH
========================= */

const wasteConfig = {
  organik:   { label: "Organik",   color: "#74c69d" },
  anorganik: { label: "Anorganik", color: "#f4a261" },
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

  if (isNaN(nilai)) {
    alert("Masukkan jumlah!");
    return;
  }

  const totalBaru = dataSampah[jenis] + nilai;

  if (totalBaru < 0) {
    alert("Jumlah tidak boleh negatif!");
    return;
  }

  dataSampah[jenis] = totalBaru;

  historiSampah.unshift({
    jenis: jenis,
    jumlah: nilai,
    waktu: new Date().toLocaleString("id-ID")
  });

  trackAction("Update " + jenis);

  simpanKeLocal();
  simpanHistori();
  renderSampah();
  renderHistori();
  updateChart();

  input.value = "";
}

function updateChart(){

const data=Object.keys(wasteConfig).map(k=>dataSampah[k]);

if(chartHome){
chartHome.data.datasets[0].data=data;
chartHome.update();
}

if(chartManage){
chartManage.data.datasets[0].data=data;
chartManage.update();
}

updateStats();
renderRanking();

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
   CHART.JS
========================= */

let chartHome;
let chartManage;

function initChart() {

  const ctxHome = document.getElementById("wasteChartHome");
  const ctxManage = document.getElementById("wasteChartManage");

  const labels = Object.values(wasteConfig).map(w => w.label);
  const colors = Object.values(wasteConfig).map(w => w.color);
  const data = Object.keys(wasteConfig).map(k => dataSampah[k]);

  if (ctxHome) {
    chartHome = new Chart(ctxHome, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Jumlah Sampah (kg)",
          data: data,
          backgroundColor: colors,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  if (ctxManage) {
    chartManage = new Chart(ctxManage, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Jumlah Sampah (kg)",
          data: data,
          backgroundColor: colors,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}


/* =========================
   GOOGLE ANALYTICS TRACKING
========================= */

function trackAction(actionName) {
  if (typeof gtag === "function") {
    gtag('event', actionName, {
      event_category: 'Waste Action',
      event_label: 'EcoSimbel'
    });
  }
}


/* =========================
   ANIMASI PER PAGE
========================= */

function animatePage(pageId) {

  const page = document.getElementById(pageId);
  if (!page) return;

  const animatedItems = page.querySelectorAll(
    ".about-card, .team-card, .service-item, .waste-card"
  );

  animatedItems.forEach((item, index) => {
    item.classList.remove("animate");

    setTimeout(() => {
      item.classList.add("animate");
    }, index * 120);
  });
}

function animateCounter(element,target){

let start=0;
const duration=800;
const stepTime=20;
const step=Math.ceil(target/(duration/stepTime));

const timer=setInterval(()=>{

start+=step;

if(start>=target){
start=target;
clearInterval(timer);
}

element.textContent=start.toFixed(1)+" kg";

},stepTime);

}

function renderRanking(){

const list=document.getElementById("rankingWaste");
if(!list) return;

list.innerHTML="";

const sorted=Object.entries(dataSampah)
.sort((a,b)=>b[1]-a[1]);

sorted.forEach(item=>{

const li=document.createElement("li");

li.innerHTML=`
<span>${wasteConfig[item[0]].label}</span>
<strong>${item[1].toFixed(1)} kg</strong>
`;

list.appendChild(li);

});

}

function updateStats(){

const totalWasteEl=document.getElementById("totalWaste");
const totalHistoriEl=document.getElementById("totalHistori");
const topWasteEl=document.getElementById("topWaste");

if(!totalWasteEl) return;

let total=0;
let maxJenis="";
let maxValue=0;

Object.entries(dataSampah).forEach(([jenis,value])=>{

total+=value;

if(value>maxValue){
maxValue=value;
maxJenis=wasteConfig[jenis].label;
}

});

totalWasteEl.textContent=total.toFixed(1)+" kg";

if(totalHistoriEl){
totalHistoriEl.textContent=historiSampah.length;
}

if(topWasteEl){
topWasteEl.textContent=maxJenis || "-";
}

}

if(document.getElementById("earth-bg")){

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("earth-bg").appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32);

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load(
"https://threejsfundamentals.org/threejs/resources/images/earth-day.jpg"
);

const material = new THREE.MeshBasicMaterial({map:earthTexture});
const earth = new THREE.Mesh(geometry, material);

scene.add(earth);

camera.position.z = 10;

function animate(){
requestAnimationFrame(animate);

earth.rotation.y += 0.002;

renderer.render(scene, camera);
}

animate();

}
