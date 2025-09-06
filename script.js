// Simple client-side app (no backend). Copy-paste as-is.
let users = [];
let products = [
  {id:1,title:"Recycled Tote Bag",category:"Bags",description:"Handmade from recycled fabric",price:12.99,owner:''},
  {id:2,title:"Bamboo Toothbrush (2 pack)",category:"Personal",description:"Eco-friendly daily",price:5.50,owner:''},
  {id:3,title:"Zero-waste Soap Bar",category:"Home",description:"Scented, plastic-free",price:4.25,owner:''}
];
let nextProductId = 4;
let currentUser = null;

function $(id){return document.getElementById(id)}
function show(el, yes=true){ if(el) el.style.display = yes ? "" : "none" }

function updateUI(){
  $("greeting").innerText = currentUser ? `Hi, ${currentUser.username}` : "Hello, Guest";
  show($("logoutBtn"), !!currentUser);
  show($("addProductCard"), !!currentUser);
  show($("checkoutBtn"), currentUser && currentUser.cart && currentUser.cart.length>0);
  renderProducts();
  renderCart();
  // Auth blocks
  show($("registerBlock"), !currentUser);
  show($("loginBlock"), !currentUser);
}

function register(){
  const username = $("regName").value.trim();
  const email = $("regEmail").value.trim().toLowerCase();
  const pass = $("regPass").value;
  if(!username||!email||!pass) return alert("Fill all fields");
  if(users.find(u=>u.email===email)) return alert("Email exists");
  const u = {username,email,password:pass,points:0,cart:[]};
  users.push(u);
  currentUser = u;
  $("regName").value=""; $("regEmail").value=""; $("regPass").value="";
  alert(`🎉 Welcome, ${username}!`);
  updateUI();
}

function login(){
  const email = $("logEmail").value.trim().toLowerCase();
  const pass = $("logPass").value;
  const u = users.find(x=>x.email===email && x.password===pass);
  if(!u) return alert("Wrong credentials");
  currentUser = u;
  $("logEmail").value=""; $("logPass").value="";
  alert(`💚 Welcome back, ${u.username}!`);
  updateUI();
}

function logout(){
  if(currentUser) alert(`👋 Bye ${currentUser.username}!`);
  currentUser = null;
  updateUI();
}

function addProduct(){
  if(!currentUser) return alert("Login first");
  const t = $("pTitle").value.trim();
  const c = $("pCategory").value.trim();
  const d = $("pDesc").value.trim();
  const p = parseFloat($("pPrice").value);
  if(!t||!c||isNaN(p)) return alert("Complete product info");
  products.unshift({id: nextProductId++, title:t, category:c, description:d, price:p, owner:currentUser.email});
  $("pTitle").value=""; $("pCategory").value=""; $("pDesc").value=""; $("pPrice").value="";
  alert("🌟 Product added!");
  renderProducts();
}

function renderProducts(){
  const list = $("productList"); list.innerHTML="";
  const q = $("search").value.trim().toLowerCase();
  products.filter(p => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    .forEach(p => {
      const li = document.createElement("li");
      li.className = "product-item";
      li.innerHTML = `<div>
          <strong>${escapeHtml(p.title)}</strong><div class="small">${escapeHtml(p.category)} • ${escapeHtml(p.description)}</div>
        </div>
        <div class="row">
          <div class="small">$${p.price.toFixed(2)}</div>
          <button onclick="addToCart(${p.id})">➕ Add</button>
        </div>`;
      list.appendChild(li);
    });
}

function addToCart(pid){
  if(!currentUser) return alert("Please login to add to cart");
  const prod = products.find(p=>p.id===pid);
  if(!prod) return;
  currentUser.cart = currentUser.cart || [];
  const item = currentUser.cart.find(i => i.product.id === pid);
  if(item) item.quantity++;
  else currentUser.cart.push({product:prod, quantity:1});
  alert(`🛒 Added ${prod.title} to cart`);
  renderCart();
}

function renderCart(){
  const list = $("cartList"); list.innerHTML="";
  if(!currentUser || !currentUser.cart || currentUser.cart.length===0){
    list.innerHTML = "<li class='small'>Your cart is empty</li>";
    $("total").innerText = "Total: $0.00";
    show($("checkoutBtn"), false);
    return;
  }
  let total = 0;
  currentUser.cart.forEach(ci => {
    total += ci.product.price * ci.quantity;
    const li = document.createElement("li");
    li.className = "product-item";
    li.innerHTML = `<div><strong>${escapeHtml(ci.product.title)}</strong><div class="small">${ci.quantity} × $${ci.product.price.toFixed(2)}</div></div>
                    <div class="row">
                      <button onclick="dec(${ci.product.id})">–</button>
                      <button onclick="inc(${ci.product.id})">+</button>
                      <button onclick="remove(${ci.product.id})">🗑️</button>
                    </div>`;
    list.appendChild(li);
  });
  $("total").innerText = `Total: $${total.toFixed(2)}`;
  show($("checkoutBtn"), true);
}

function inc(pid){ const item=currentUser.cart.find(i=>i.product.id===pid); if(item){item.quantity++; renderCart();} }
function dec(pid){ const item=currentUser.cart.find(i=>i.product.id===pid); if(item){ item.quantity--; if(item.quantity<=0) remove(pid); renderCart(); } }
function remove(pid){ currentUser.cart = currentUser.cart.filter(i=>i.product.id!==pid); renderCart(); }

function checkout(){
  if(!currentUser || !currentUser.cart || currentUser.cart.length===0) return alert("Cart empty");
  let total=0; currentUser.cart.forEach(i=> total += i.product.price * i.quantity);
  const earned = Math.floor(total/10);
  currentUser.points = (currentUser.points||0) + earned;
  currentUser.cart = [];
  alert(`✅ Checkout done! You earned ${earned} eco points 🌱`);
  updateUI();
}

function escapeHtml(text){
  return String(text||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// initial render
updateUI();
renderProducts();