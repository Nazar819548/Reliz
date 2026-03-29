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
const cartBtn = document.getElementById("cartBtn");

const searchInput = document.getElementById("searchInput");
const priceFilter = document.getElementById("priceFilter");

let cart = []; 
let isLogged = false;
let currentBalance = 0;
let productsData = []; 


function filterAndDisplay() {
    const term = searchInput.value.toLowerCase();
    const sortMode = priceFilter.value;
    let filtered = productsData.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
    );

    if (sortMode === "cheap") filtered.sort((a, b) => a.price - b.price);
    if (sortMode === "expensive") filtered.sort((a, b) => b.price - a.price);

    displayProducts(filtered);
}

searchInput.addEventListener("input", filterAndDisplay);
priceFilter.addEventListener("change", filterAndDisplay);


function updateCartUI() {
    const list = document.getElementById("cartItemsList");
    list.innerHTML = cart.length ? "" : "<p>Кошик порожній</p>";
    let total = 0;

    cart.forEach((item, i) => {
        total += item.price;
        const d = document.createElement("div");
        d.className = "cart-item";
        d.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #eee; background: #f9f9f9; border-radius: 8px;";
        d.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:bold;">${item.name}</span>
                <span style="font-size:0.8rem; color: #666;">${item.price} Logiks</span>
            </div>
            <button onclick="removeFromCart(${i})" style="background:#ff4757; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;">&times;</button>
        `;
        list.appendChild(d);
    });

    document.getElementById("cartTotal").innerText = total;
    cartCountElement.innerText = cart.length;
}

window.removeFromCart = (i) => {
    cart.splice(i, 1);
    updateCartUI();
};


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


window.showGlobalAlert = (text) => {
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
};

window.postAnnouncement = () => {
    const text = document.getElementById("announcementText").value;
    if (text) {
        localStorage.setItem("adminAnnouncement", text);
        const box = document.getElementById("adminAnnouncement");
        box.innerText = "📢 " + text;
        box.style.display = "block";
        adminModal.style.display = "none";
    }
};

window.postGlobalMessage = () => {
    const text = document.getElementById("announcementText").value;
    if (text) {
        showGlobalAlert(text);
        adminModal.style.display = "none";
    }
};

window.clearAnnouncement = () => {
    localStorage.removeItem("adminAnnouncement");
    document.getElementById("adminAnnouncement").style.display = "none";
    adminModal.style.display = "none";
};

window.activateCustomSale = () => {
    const mult = parseFloat(document.getElementById("salePercent").value);
    fetch("data.json").then(res => res.json()).then(base => {
        productsData = base.map(p => ({ ...p, price: Math.floor(p.price * mult) }));
        localStorage.setItem("myStoreProducts", JSON.stringify(productsData));
        filterAndDisplay();
        adminModal.style.display = "none";
    }).catch(() => alert("Помилка: файл data.json не знайдено"));
};

window.resetPrices = () => {
    fetch("data.json").then(res => res.json()).then(data => {
        productsData = data;
        localStorage.setItem("myStoreProducts", JSON.stringify(data));
        filterAndDisplay();
        adminModal.style.display = "none";
    });
};

window.addNewProduct = () => {
    const name = document.getElementById("newPName").value;
    const price = parseInt(document.getElementById("newPPrice").value);
    const desc = document.getElementById("newPDesc").value || "Опис відсутній";
    const img = document.getElementById("newPImg").value || "https://via.placeholder.com/150";
    
    if (name && price) {
        productsData.unshift({ name, price, description: desc, image: img });
        localStorage.setItem("myStoreProducts", JSON.stringify(productsData));
        filterAndDisplay();
        adminModal.style.display = "none";
        
        document.getElementById("newPName").value = "";
        document.getElementById("newPPrice").value = "";
        document.getElementById("newPDesc").value = "";
    } else {
        alert("Вкажіть назву та ціну!");
    }
};


let pollTimerInterval;
window.startPoll = () => {
    const q = document.getElementById("pollQuestion").value;
    const o1 = document.getElementById("pollOpt1").value;
    const o2 = document.getElementById("pollOpt2").value;
    if (!q || !o1 || !o2) return alert("Заповніть всі поля опитування!");
    const pData = { question: q, opt1: o1, opt2: o2, votes1: 0, votes2: 0, endTime: Date.now() + 59000 };
    localStorage.setItem("activePoll", JSON.stringify(pData));
    localStorage.removeItem("votedPoll");
    initPollUI(pData);
    adminModal.style.display = "none";
};

function initPollUI(data) {
    const pollCont = document.getElementById("activePollContainer");
    pollCont.style.display = "block";
    document.getElementById("displayPollQuest").innerText = data.question;
    document.getElementById("opt1Text").innerText = data.opt1;
    document.getElementById("opt2Text").innerText = data.opt2;
    updatePollBars(data);
    clearInterval(pollTimerInterval);
    pollTimerInterval = setInterval(() => {
        const remaining = Math.round((data.endTime - Date.now()) / 1000);
        document.getElementById("pollTimer").innerText = remaining + "s";
        if (remaining <= 0) { 
            clearInterval(pollTimerInterval); 
            setTimeout(() => pollCont.style.display = "none", 3000); 
        }
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


function displayProducts(products) {
    container.innerHTML = "";
    if (products.length === 0) { 
        container.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align:center; padding: 50px; font-size: 1.2rem; color: #666;">Нічого не знайдено 🔍</div>`; 
        return; 
    }
    products.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.setAttribute("data-aos", "fade-up");
        card.innerHTML = `
            <div class="img-wrapper"><img src="${p.image}"></div>
            <h3>${p.name}</h3>
            <p class="product-description" style="font-size: 0.9rem; color: #777; margin: 5px 15px; min-height: 40px;">${p.description || "Якісний товар від Logika"}</p>
            <p class="price" style="font-weight: bold; color: #6c5ce7; font-size: 1.1rem;">${p.price} Logiks</p>
            <button class="buy-btn">Придбати</button>
        `;
        card.querySelector(".buy-btn").onclick = () => {
            if (!isLogged) return alert("Спочатку увійдіть у свій аккаунт!");
            cart.push(p);
            updateCartUI();
            alert(`"${p.name}" додано до кошика!`);
        };
        container.appendChild(card);
    });
}


window.onload = () => {
    const user = getCookie("username");
    if (user) {
        isLogged = true;
        loginBtn.innerText = user;
        regBtn.style.display = "none";
        currentBalance = (user === "NazarProgram") ? 999999 : 1000;
        balanceElement.innerText = currentBalance;
        if (user === "NazarProgram") document.getElementById("adminBtn").style.display = "block";
    }

    const savedAnn = localStorage.getItem("adminAnnouncement");
    if (savedAnn) {
        const b = document.getElementById("adminAnnouncement");
        b.innerText = "📢 " + savedAnn;
        b.style.display = "block";
    }
    
    const savedP = localStorage.getItem("myStoreProducts");
    if (savedP) {
        productsData = JSON.parse(savedP);
        displayProducts(productsData);
    } else {
        fetch("data.json")
            .then(r => r.json())
            .then(d => { 
                productsData = d; 
                displayProducts(d); 
            })
            .catch(() => { 
                productsData = []; 
                displayProducts([]);
            });
    }

    const pol = localStorage.getItem("activePoll");
    if (pol) {
        const d = JSON.parse(pol);
        if (d.endTime > Date.now()) initPollUI(d);
    }
};

loginBtn.onclick = () => loginModal.style.display = "block";
document.getElementById("closeL").onclick = () => loginModal.style.display = "none";
document.getElementById("submitLogin").onclick = () => {
    const u = document.getElementById("username").value;
    if (u) { setCookie("username", u, 7); location.reload(); }
};

regBtn.onclick = () => regModal.style.display = "block";
document.getElementById("closeR").onclick = () => regModal.style.display = "none";
document.getElementById("submitReg").onclick = () => {
    const u = document.getElementById("regUsername").value;
    if (u) { setCookie("username", u, 7); location.reload(); }
};

cartBtn.onclick = () => { updateCartUI(); cartModal.style.display = "block"; };
document.querySelector(".close-cart").onclick = () => cartModal.style.display = "none";
document.getElementById("adminBtn").onclick = () => adminModal.style.display = "block";
document.getElementById("closeAdmin").onclick = () => adminModal.style.display = "none";

document.getElementById("checkoutBtn").onclick = () => {
    if (cart.length === 0) return alert("Кошик порожній!");
    let total = parseInt(document.getElementById("cartTotal").innerText);
    if (currentBalance < total) return alert("Недостатньо Logiks на балансі!");
    cartModal.style.display = "none";
    orderModal.style.display = "block";
};

document.getElementById("confirmOrder").onclick = () => {
    const fn = document.getElementById("firstName").value;
    const ln = document.getElementById("lastName").value;
    if(!fn || !ln) return alert("Заповніть дані для доставки!");
    
    alert(`Замовлення оформлено на ім'я ${fn} ${ln}!`);
    let total = parseInt(document.getElementById("cartTotal").innerText);
    currentBalance -= total;
    balanceElement.innerText = currentBalance;
    cart = [];
    updateCartUI();
    orderModal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target.className === 'modal') {
        loginModal.style.display = "none";
        regModal.style.display = "none";
        cartModal.style.display = "none";
        orderModal.style.display = "none";
        adminModal.style.display = "none";
    }
};
