
const container = document.getElementById("products");
const cartCountElement = document.getElementById("cartCount");
const balanceElement = document.getElementById("userBalance");


const loginModal = document.getElementById("loginModal");
const cartModal = document.getElementById("cartModal");
const orderModal = document.getElementById("orderModal");

const loginBtn = document.getElementById("loginBtn");
const submitLogin = document.getElementById("submitLogin");
const closeLogin = document.querySelector(".close-login");


const cartItemsList = document.getElementById("cartItemsList");
const cartTotalLabel = document.getElementById("cartTotal");

let cart = []; 
let isLogged = false;
let currentBalance = 0;
let userRealBalance = 1000; 

balanceElement.innerText = currentBalance;


loginBtn.onclick = () => loginModal.style.display = "block";
closeLogin.onclick = () => loginModal.style.display = "none";

submitLogin.onclick = () => {
    const user = document.getElementById("username").value;
    if (user.length >= 2) {
        isLogged = true;
        currentBalance = userRealBalance;
        balanceElement.innerText = currentBalance;
        loginBtn.innerText = user;
        loginModal.style.display = "none";
        alert(`Вітаємо, ${user}! Твій баланс: ${currentBalance} Logiks`);
    } else {
        alert("Введіть логін (мінімум 2 символи)");
    }
};

document.getElementById("cartBtn").onclick = () => {
    renderCart();
    cartModal.style.display = "block";
};


document.querySelector(".close-cart").onclick = () => cartModal.style.display = "none";
document.querySelector(".close-order").onclick = () => orderModal.style.display = "none";


function renderCart() {
    cartItemsList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = "<p style='text-align:center;'>Кошик порожній</p>";
    }

    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement("div");
        div.classList.add("cart-item"); 
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.marginBottom = "10px";
        
        div.innerHTML = `
            <span>${item.name} (${item.price} L)</span>
            <button onclick="removeFromCart(${index})" style="background:#ff4444; color:white; border:none; cursor:pointer; border-radius:5px;">Видалити</button>
        `;
        cartItemsList.appendChild(div);
    });

    cartTotalLabel.innerText = total;
}


window.removeFromCart = function(index) {
    cart.splice(index, 1);
    cartCountElement.innerText = cart.length;
    renderCart();
};


fetch("data.json")
    .then(response => response.json())
    .then(data => {
        data.forEach(product => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("data-aos", "fade-up");

            card.innerHTML = `
                <div class="img-wrapper">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <h3>${product.name}</h3>
                <p class="price">${product.price} Logiks</p>
                <button class="buy-btn">Придбати</button>
            `;

            const btn = card.querySelector(".buy-btn");
            
            btn.addEventListener("click", () => {
                if (!isLogged) {
                    alert("Спочатку увійдіть у свій аккаунт Logika!");
                    return;
                }

                
                cart.push(product);
                cartCountElement.innerText = cart.length;

                
                btn.innerText = "В кошику!";
                btn.style.background = "#4CAF50";
                setTimeout(() => {
                    btn.innerText = "Придбати";
                    btn.style.background = "#222";
                }, 800);
            });

            container.appendChild(card);
        });
    })
    .catch(error => console.error("Помилка:", error));



document.getElementById("checkoutBtn").onclick = () => {
    let total = parseInt(cartTotalLabel.innerText);
    
    if (cart.length === 0) {
        alert("Кошик порожній!");
        return;
    }

    if (currentBalance < total) {
        alert(`Недостатньо логіків! Твій баланс: ${currentBalance}, а потрібно: ${total}`);
    } else {
        cartModal.style.display = "none";
        orderModal.style.display = "block";
    }
};

document.getElementById("confirmOrder").onclick = () => {
    const fname = document.getElementById("firstName").value;
    const lname = document.getElementById("lastName").value;
    let total = parseInt(cartTotalLabel.innerText);

    if (fname.trim() !== "" && lname.trim() !== "") {
        currentBalance -= total;
        balanceElement.innerText = currentBalance;
        
        alert(`Дякуємо, ${fname} ${lname}! Замовлення на суму ${total} Logiks прийнято!`);
        
       
        cart = [];
        cartCountElement.innerText = "0";
        orderModal.style.display = "none";
        
        
        document.getElementById("firstName").value = "";
        document.getElementById("lastName").value = "";
    } else {
        alert("Будь ласка, введіть Прізвище та Ім'я!");
    }
};


window.onclick = (event) => {
    if (event.target == loginModal) loginModal.style.display = "none";
    if (event.target == cartModal) cartModal.style.display = "none";
    if (event.target == orderModal) orderModal.style.display = "none";
};
