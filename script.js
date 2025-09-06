// simple client-side app with product cards + icons
let users = [];
let products = [
  {id:1,title:"Recycled Tote Bag",category:"Accessories",description:"Sturdy tote made from recycled fabric. Carry groceries guilt-free.",price:249, icon:"fa-solid fa-bag-shopping"},
  {id:2,title:"Bamboo Toothbrush (2 pack)",category:"Personal Care",description:"Biodegradable toothbrushes with soft bristles.",price:129, icon:"fa-solid fa-tooth"},
  {id:3,title:"Zero-waste Soap Bar",category:"Home",description:"Scented soap bar, plastic-free packaging.",price:89, icon:"fa-solid fa-soap"}
];
let nextProductId = 4;
let currentUser = null;

function $(id){return document.getElementById(id)}
function show(el, yes=true){ if(el) el.style.display = yes ? "" : "none" }

function updateUI(){
  $("points").querySelector("strong").innerText = currentUser ? (currentUser.points||0) : 0;
  show($("addProductCard"), !!currentUser);
  show($("logoutBtn"), !!currentUser);
  show($("registerBlock"), !currentUser);
  show($("loginBlock"), false);
  renderProducts();
  renderCart();
}

function showLogin(){
  show($("registerBlock"), false);
  show($("loginBlock"), true);
}
function showRegister(){
  show($("loginBlock"), false);
  show($("registerBlock"), true);
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
  const c = $("pCategory").value.trim() || "Misc";
  const d = $("pDesc").value.trim();
  const icon = $("pIcon").value.trim();
  const p = parseFloat($("pPrice").value);
  if(!t || isNaN(p)) return alert("Complete product info");
  const item = {id: nextProductId++, title:t, category:c, description:d, price:p, icon: icon || "fa-solid fa-seedling"};
  products.unshift(item);
  $("pTitle").value=""; $("pCategory").value=""; $("pDesc").value=""; $("pPrice").value=""; $("pIcon").value="";
  alert("🌟 Product added!");
  renderProducts();
}

function renderProducts(){
  const list = $("products"); list.innerHTML="";
  const q = $("search").value.trim().toLowerCase();
  const filtered = products.filter(p => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";
    const thumb = document.createElement("div");
    thumb.className = "product-thumb";
    // icon using FontAwesome class or fallback emoji
    if(p.icon && p.icon.startsWith("fa")) {
      thumb.innerHTML = `<i class="${p.icon}" style="font-size:28px;color:var(--accent)"></i>`;
    } else {
      // emoji fallback if user typed emoji or nothing
      thumb.innerText = p.icon ? p.icon : "🛍️";
    }

    const info = document.createElement("div");
    info.className = "product-info";
    info.innerHTML = `<h4>${escapeHtml(p.title)}</h4>
                      <div class="small">${escapeHtml(p.category)}</div>
                      <p>${escapeHtml(p.description)}</p>
                      <div class="product-footer">
                        <div class="price">$${p.price.toFixed(2)}</div>
                        <div>
                          <button class="btn ghost" onclick="addToCart(${p.id})">➕ Add</button>
                        </div>
                      </div>`;

    div.appendChild(thumb);
    div.appendChild(info);
    list.appendChild(div);
  });
}

function addToCart(pid){
  if(!currentUser) return alert("Please login to add to cart");
  const prod = products.find(p=>p.id===pid);
  currentUser.cart = currentUser.cart || [];
  const item = currentUser.cart.find(i => i.product.id === pid);
  if(item) item.quantity++;
  else currentUser.cart.push({product:prod, quantity:1});
  alert(`🛒 Added ${prod.title} to cart`);
  renderCart();
}

function renderCart(){
  const out = $("cartList"); out.innerHTML="";
  if(!currentUser || !currentUser.cart || currentUser.cart.length===0){
    out.innerHTML = "<li class='small'>Your cart is empty</li>";
    $("total").innerText = "Total: $0.00";
    show($("checkoutBtn"), false);
    return;
  }
  let total = 0;
  currentUser.cart.forEach(ci => {
    total += ci.product.price * ci.quantity;
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(ci.product.title)} x ${ci.quantity}</span><span>$${(ci.product.price*ci.quantity).toFixed(2)}</span>`;
    out.appendChild(li);
  });
  $("total").innerText = `Total: $${total.toFixed(2)}`;
  show($("checkoutBtn"), true);
}

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
