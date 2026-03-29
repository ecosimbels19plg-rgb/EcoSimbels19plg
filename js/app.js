
window.addEventListener("load", function(){

    tampilkanDokumentasi();
    tampilkanFiturAdmin();

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

  // 🔥 TAMBAHAN INI
  setTimeout(() => {
    initChart();
    updateChart();
  }, 200);

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
  updateChart();
  updateStats();
  renderRanking();
})

;


/* =========================
   ROLE USER
========================= */



let isAdmin = false;

function loginAdmin() {
    const password = prompt("Masukkan password admin:");

    if (password === "admin123") {
        isAdmin = true;
        alert("Login berhasil!");
        tampilkanFiturAdmin();
        renderSampah();
        updateChart();
    } else {
        alert("Password salah!");
    }
}

function refreshUI() {
  tampilkanFiturAdmin();
  renderSampah();
  updateStats();
  renderRanking();
}

function logoutAdmin() {
    isAdmin = false;
    alert("Logout berhasil!");
    tampilkanFiturAdmin();
}

function tampilkanFiturAdmin() {

    // 🔹 tombol login/logout
    const loginBtn = document.querySelector("button[onclick='loginAdmin()']");
    const logoutBtn = document.querySelector("button[onclick='logoutAdmin()']");

    loginBtn.style.display = isAdmin ? "none" : "inline-block";
    logoutBtn.style.display = isAdmin ? "inline-block" : "none";

    // 🔹 form upload dokumentasi
    const adminUpload = document.getElementById("adminUpload");
    if (adminUpload) {
        adminUpload.style.display = isAdmin ? "block" : "none";
    }

    // 🔹 input pengelolaan sampah
    const inputSampah = document.querySelectorAll(".waste-card input, .btn-konfirmasi");

    inputSampah.forEach(el => {
        el.style.display = isAdmin ? "block" : "none";
    });

    // refresh tampilan dokumentasi (biar tombol hapus muncul/hilang)
    tampilkanDokumentasi();

    const historiSection = document.getElementById("historiSection");

if(historiSection){
    historiSection.style.display = isAdmin ? "block" : "none";
}
}

function updateAdminUI() {
  const loginBtn = document.querySelector("button[onclick='loginAdmin()']");
  const logoutBtn = document.querySelector("button[onclick='logoutAdmin()']");

  if (!loginBtn || !logoutBtn) return;

  loginBtn.style.display = isAdmin ? "none" : "inline-block";
  logoutBtn.style.display = isAdmin ? "inline-block" : "none";
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
let currentPage = 1;
let perPage = 10;

function renderHistori(){

let tbody = document.getElementById("historiBody");
if(!tbody) return;

tbody.innerHTML = "";

// pagination
let start = (currentPage - 1) * perPage;
let end = start + perPage;
let data = historiSampah.slice(start, end);

data.forEach((item, index) => {

let realIndex = start + index;

let row = `
<tr>
<td>${item.waktu}</td>
<td>${item.jenis.toUpperCase()}</td>
<td class="${item.jumlah >= 0 ? 'plus' : 'minus'}">
${item.jumlah > 0 ? '+' : ''}${item.jumlah} kg
</td>
<td>
${isAdmin ? `<button onclick="hapusHistori(${realIndex})">🗑️</button>` : ""}
</td>
</tr>
`
;

tbody.innerHTML += row;

});

updateButtons(); // penting!
}

function hapusHistori(index){

if(confirm("Yakin ingin menghapus data ini?")){

// hapus data
historiSampah.splice(index, 1);

// 🔥 HITUNG ULANG data sampah
resetDataSampah();

// simpan ulang
localStorage.setItem("historiSampah", JSON.stringify(historiSampah));
localStorage.setItem("dataSampah", JSON.stringify(dataSampah));

// render ulang semua
renderHistori();
renderSampah();
updateChart();

}

}

function resetDataSampah(){

// reset semua ke 0
Object.keys(dataSampah).forEach(jenis=>{
dataSampah[jenis] = 0;
});

// hitung ulang dari histori
historiSampah.forEach(item=>{
dataSampah[item.jenis] += item.jumlah;
});

}

document.getElementById("nextBtn").onclick = function(){

if(currentPage * perPage < historiSampah.length){
currentPage++;
renderHistori();
}

};

document.getElementById("prevBtn").onclick = function(){

if(currentPage > 1){
currentPage--;
renderHistori();
}

};

function updateButtons(){

document.getElementById("prevBtn").disabled = currentPage === 1;

document.getElementById("nextBtn").disabled =
currentPage * perPage >= historiSampah.length;

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

    const disabled = !isAdmin;
    if (inputEl) inputEl.disabled = disabled;
    if (btn) btn.disabled = disabled;
  });
}


/* =========================
   KONFIRMASI TAMBAH / KURANG
========================= */

function konfirmasiSampah(jenis) {

  if (!isAdmin) {
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

  const data = Object.keys(wasteConfig).map(k => dataSampah[k] || 0);

  if(chartHome){
    chartHome.data.datasets[0].data = data;
    chartHome.update();
  }

  if(chartManage){
    chartManage.data.datasets[0].data = data;
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

  if (data) {
    const parsed = JSON.parse(data);

    // 🔥 pastikan semua jenis tetap ada
    Object.keys(wasteConfig).forEach(k => {
      dataSampah[k] = parsed[k] || 0;
    });
  }
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

  if (ctxHome) {
    chartHome = new Chart(ctxHome, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Jumlah Sampah (kg)",
          data: [], // kosong dulu
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
          data: [],
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

  // 🔥 penting
  updateChart();
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

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const answer = btn.nextElementSibling;

    document.querySelectorAll(".faq-item").forEach(item => {
      if(item !== btn.parentElement){
        item.classList.remove("active");
        item.querySelector(".faq-answer").style.maxHeight = null;
      }
    });

    // toggle class active
    item.classList.toggle("active");

    if(answer.style.maxHeight){
      answer.style.maxHeight = null;
    } else {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

function uploadDokumentasi() {

    if (!isAdmin) {
        alert("Hanya admin yang bisa upload!");
        return;
    }

    const files = document.getElementById("mediaInput").files;
    const nama = document.getElementById("activityName").value;
    const tanggal = document.getElementById("activityDate").value;

    if (files.length === 0 || !nama || !tanggal) {
        alert("Lengkapi semua data!");
        return;
    }

    let mediaList = [];
    let selesai = 0;

    Array.from(files).forEach(file => {

        const reader = new FileReader();

        reader.onload = function (e) {

            mediaList.push({
                src: e.target.result,
                type: file.type
            });

            selesai++;

            if (selesai === files.length) {

                let data = JSON.parse(localStorage.getItem("dokumentasi")) || [];

                data.push({
                    nama,
                    tanggal,
                    media: mediaList
                });

                localStorage.setItem("dokumentasi", JSON.stringify(data));

                tampilkanDokumentasi();

                // reset form
                document.getElementById("mediaInput").value = "";
                document.getElementById("activityName").value = "";
                document.getElementById("activityDate").value = "";

                alert("Upload berhasil!");
            }
        };

        reader.readAsDataURL(file);
    });
}

function tampilkanDokumentasi() {

    const container = document.getElementById("documentationList");
    let data = JSON.parse(localStorage.getItem("dokumentasi")) || [];

    container.innerHTML = "";

    data.forEach((item, index) => {

        let mediaHTML = "";

        item.media.forEach(m => {
            if (m.type.startsWith("image")) {
                mediaHTML += `<img src="${m.src}" class="media-item">`;
            } else {
                mediaHTML += `<video src="${m.src}" controls class="media-item"></video>`;
            }
        });

        container.innerHTML = `
            <div class="dokumentasi-item">

                <div class="media-slider">
                    ${mediaHTML}
                </div>

                <p class="judul-kegiatan">
                    ${item.nama} (${item.tanggal})
                </p>

                ${isAdmin ? `<button onclick="hapusDokumentasi(${index})">🗑 Hapus</button>` : ""}
            </div>
        ` + container.innerHTML;

    });
}

function hapusDokumentasi(index) {
    let data = JSON.parse(localStorage.getItem("dokumentasi")) || [];
    data.splice(index, 1);
    localStorage.setItem("dokumentasi", JSON.stringify(data));
    tampilkanDokumentasi();
}

function toggleCard(header) {
  const card = header.parentElement;
  const body = header.nextElementSibling;

  document.querySelectorAll(".card").forEach(c => {
    if (c !== card) c.classList.remove("active");
  });

  card.classList.toggle("active");

  if(body){
    body.scrollTop = 0; // reset scroll
  }
}
