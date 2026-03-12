const container = document.getElementById("products");
const cartCountElement = document.getElementById("cartCount");
const balanceElement = document.getElementById("userBalance");

const loginModal = document.getElementById("loginModal");
const regModal = document.getElementById("regModal"); 
const cartModal = document.getElementById("cartModal");
const orderModal = document.getElementById("orderModal");

const adminModal = document.getElementById("adminModal");
const loginBtn = document.getElementById("loginBtn");
const regBtn = document.getElementById("regBtn"); 

const searchInput = document.getElementById("searchInput");
const priceFilter = document.getElementById("priceFilter");

let cart = []; 
let isLogged = false;
let currentBalance = 0;
let productsData = []; 


function filterAndDisplay() {
    const term = searchInput.value.toLowerCase();
    const sortMode = priceFilter.value;
    let filtered = productsData.filter(p => p.name.toLowerCase().includes(term));

    if (sortMode === "cheap") filtered.sort((a, b) => a.price - b.price);
    if (sortMode === "expensive") filtered.sort((a, b) => b.price - a.price);

    displayProducts(filtered);
}

searchInput.addEventListener("input", filterAndDisplay);
priceFilter.addEventListener("change", filterAndDisplay);


function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


function showGlobalAlert(text) {
    let alertBox = document.getElementById("globalAlertBar");
    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "globalAlertBar";
        alertBox.style = "position: fixed; top: 0; left: 0; width: 100%; background: #ff4757; color: white; text-align: center; padding: 15px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 10px rgba(0,0,0,0.3);";
        document.body.prepend(alertBox);
    }
    let seconds = 10;
    const interval = setInterval(() => {
        alertBox.innerHTML = `NazarProgram ✓: ${text} <span style="margin-left:10px; background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:4px;">${seconds}s</span>`;
        seconds--;
        if (seconds < 0) { clearInterval(interval); alertBox.remove(); }
    }, 1000);
}


let pollTimerInterval;
function initPollUI(data) {
    const container = document.getElementById("activePollContainer");
    container.style.display = "block";
    document.getElementById("displayPollQuest").innerText = data.question;
    document.getElementById("opt1Text").innerText = data.opt1;
    document.getElementById("opt2Text").innerText = data.opt2;
    updatePollBars(data);
    clearInterval(pollTimerInterval);
    pollTimerInterval = setInterval(() => {
        const remaining = Math.round((data.endTime - Date.now()) / 1000);
        document.getElementById("pollTimer").innerText = remaining + "s";
        if (remaining <= 0) { clearInterval(pollTimerInterval); setTimeout(() => container.style.display = "none", 3000); }
    }, 1000);
}

function updatePollBars(data) {
    const total = (data.votes1 || 0) + (data.votes2 || 0);
    const p1 = total === 0 ? 0 : Math.round((data.votes1 / total) * 100);
    const p2 = total === 0 ? 0 : 100 - p1;
    document.getElementById("opt1Perc").innerText = p1 + "%";
    document.getElementById("opt2Perc").innerText = p2 + "%";
    document.getElementById("bar1").style.width = p1 + "%";
    document.getElementById("bar2").style.width = p2 + "%";
}

window.vote = (option) => {
    if (localStorage.getItem("votedPoll")) return alert("Ви вже голосували!");
    let data = JSON.parse(localStorage.getItem("activePoll"));
    if (option === 1) data.votes1++; else data.votes2++;
    localStorage.setItem("activePoll", JSON.stringify(data));
    localStorage.setItem("votedPoll", "true");
    updatePollBars(data);
};


function postAnnouncement() {
    const text = document.getElementById("announcementText").value;
    if (text) {
        localStorage.setItem("adminAnnouncement", text);
        const box = document.getElementById("adminAnnouncement");
        box.innerText = "📢 " + text;
        box.style.display = "block";
        adminModal.style.display = "none";
    }
}

function postGlobalMessage() {
    const text = document.getElementById("announcementText").value;
    if (text) {
        localStorage.setItem("globalTrigger", text);
        localStorage.removeItem("globalTrigger");
        showGlobalAlert(text);
        adminModal.style.display = "none";
    }
}

function clearAnnouncement() {
    localStorage.removeItem("adminAnnouncement");
    document.getElementById("adminAnnouncement").style.display = "none";
}

function activateCustomSale() {
    const mult = parseFloat(document.getElementById("salePercent").value);
    fetch("data.json").then(res => res.json()).then(base => {
        productsData = base.map(p => ({ ...p, price: Math.floor(p.price * mult) }));
        localStorage.setItem("myStoreProducts", JSON.stringify(productsData));
        filterAndDisplay();
        adminModal.style.display = "none";
    });
}

function resetPrices() {
    fetch("data.json").then(res => res.json()).then(data => {
        productsData = data;
        localStorage.setItem("myStoreProducts", JSON.stringify(data));
        filterAndDisplay();
        adminModal.style.display = "none";
    });
}

function startPoll() {
    const q = document.getElementById("pollQuestion").value;
    const o1 = document.getElementById("pollOpt1").value;
    const o2 = document.getElementById("pollOpt2").value;
    if (!q || !o1 || !o2) return alert("Заповніть поля!");
    const pData = { question: q, opt1: o1, opt2: o2, votes1: 0, votes2: 0, endTime: Date.now() + 59000 };
    localStorage.setItem("activePoll", JSON.stringify(pData));
    localStorage.removeItem("votedPoll");
    initPollUI(pData);
    adminModal.style.display = "none";
}

function addNewProduct() {
    const name = document.getElementById("newPName").value;
    const price = parseInt(document.getElementById("newPPrice").value);
    const img = document.getElementById("newPImg").value || "https://via.placeholder.com/150";
    if (name && price) {
        productsData.unshift({ name, price, image: img });
        localStorage.setItem("myStoreProducts", JSON.stringify(productsData));
        filterAndDisplay();
        adminModal.style.display = "none";
    }
}


function checkAdmin(user) { if (user === "NazarProgram") document.getElementById("adminBtn").style.display = "block"; }

function displayProducts(products) {
    container.innerHTML = "";
    if (products.length === 0) { container.innerHTML = `<div class="no-results">Нічого не знайдено</div>`; return; }
    products.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.setAttribute("data-aos", "fade-up");
        card.innerHTML = `<div class="img-wrapper"><img src="${p.image}"></div><h3>${p.name}</h3><p class="price">${p.price} Logiks</p><button class="buy-btn">Придбати</button>`;
        card.querySelector(".buy-btn").onclick = () => {
            if (!isLogged) return alert("Увійдіть!");
            cart.push(p); cartCountElement.innerText = cart.length;
        };
        container.appendChild(card);
    });
}

window.onload = () => {
    const user = getCookie("username");
    if (user) {
        isLogged = true; loginBtn.innerText = user; regBtn.style.display = "none";
        currentBalance = (user === "NazarProgram") ? 999999 : 1000;
        balanceElement.innerText = currentBalance; checkAdmin(user);
    }
    const savedAnn = localStorage.getItem("adminAnnouncement");
    if (savedAnn) { const b = document.getElementById("adminAnnouncement"); b.innerText = "📢 " + savedAnn; b.style.display = "block"; }
    
    const savedP = localStorage.getItem("myStoreProducts");
    if (savedP) { productsData = JSON.parse(savedP); displayProducts(productsData); }
    else { fetch("data.json").then(r => r.json()).then(d => { productsData = d; displayProducts(d); }); }
    
    const pol = localStorage.getItem("activePoll");
    if (pol) { const d = JSON.parse(pol); if (d.endTime > Date.now()) initPollUI(d); }
};


document.getElementById("adminBtn").onclick = () => adminModal.style.display = "block";
document.getElementById("closeAdmin").onclick = () => adminModal.style.display = "none";
document.getElementById("loginBtn").onclick = () => loginModal.style.display = "block";
document.getElementById("closeL").onclick = () => loginModal.style.display = "none";
document.getElementById("submitLogin").onclick = () => {
    const u = document.getElementById("username").value;
    if (u) { setCookie("username", u, 7); location.reload(); }
};
