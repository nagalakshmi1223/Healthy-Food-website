// ------- Demo Data (healthy-only) -------
const FOODS = [
  {
    id: 1,
    name: "Apple",
    category: "fruit",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    serving: "1 medium (182g)",
    price: 20,
    image: "./apple.jpg"
  },
  {
    id: 2,
    name: "Banana",
    category: "fruit",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    serving: "1 medium (118g)",
    price: 10,
    image: "./banana.jpg"
  },
  {
    id: 3,
    name: "Blueberries",
    category: "fruit",
    calories: 85,
    protein: 1.1,
    carbs: 21,
    fat: 0.5,
    serving: "1 cup (148g)",
    price: 80,
    image: "./blueberries.jpg"
  },
  {
    id: 4,
    name: "Spinach",
    category: "vegetable",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    serving: "100g raw",
    price: 30,
    image: "./spinach.jpg"
  },
  {
    id: 5,
    name: "Broccoli",
    category: "vegetable",
    calories: 55,
    protein: 4.7,
    carbs: 11,
    fat: 0.6,
    serving: "1 cup (156g)",
    price: 40,
    image: "./broccoli.jpg"
  },
  {
    id: 6,
    name: "Salmon",
    category: "protein",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    serving: "100g cooked",
    price: 250,
    image: "./cooked salmon.jpg"
  },
  {
    id: 7,
    name: "Chicken Breast",
    category: "protein",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: "100g cooked",
    price: 180,
    image: "./cooked chickenbreast.jpg"
  },
  {
    id: 8,
    name: "Oats",
    category: "grain",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    serving: "40g dry oats",
    price: 60,
    image: "./oats.jpg"
  },
  {
    id: 9,
    name: "Quinoa",
    category: "grain",
    calories: 120,
    protein: 4.1,
    carbs: 21,
    fat: 1.9,
    serving: "100g cooked",
    price: 90,
    image: "./cooked quinoa.jpg"
  },
  {
    id: 10,
    name: "Greek Yogurt",
    category: "dairy",
    calories: 100,
    protein: 10,
    carbs: 6,
    fat: 0,
    serving: "170g (1 cup)",
    price: 50,
    image: "./greek yogurt.jpg"
  },
  {
    id: 11,
    name: "Almonds",
    category: "nuts",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    serving: "28g (23 nuts)",
    price: 70,
    image: "./almonds.jpg"
  },
  {
    id: 12,
    name: "Chia Seeds",
    category: "nuts",
    calories: 138,
    protein: 4.7,
    carbs: 12,
    fat: 8.7,
    serving: "28g (2 tbsp)",
    price: 60,
    image: "./chia seeds.jpg"
  }
];

// ------- State & Storage Helpers -------
const store = {
  get(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

let wishlist = store.get('hb_wishlist', []);
let cart = store.get('hb_cart', []); // [{id, qty}]
let user = store.get('hb_user', null);

// ------- DOM -------
const grid = document.getElementById('grid');
const wishlistGrid = document.getElementById('wishlistGrid');
const cartList = document.getElementById('cartList');
const wishlistCount = document.getElementById('wishlist-count');
const cartCount = document.getElementById('cart-count');
const cartItemsCount = document.getElementById('cartItemsCount');
const cartCalories = document.getElementById('cartCalories');
const cartProtein = document.getElementById('cartProtein');
const cartCarbs = document.getElementById('cartCarbs');
const cartFat = document.getElementById('cartFat');
const cartPrice = document.getElementById('cartPrice');

// Filters
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const calMin = document.getElementById('calMin');
const calMax = document.getElementById('calMax');
const proteinMin = document.getElementById('proteinMin');
const clearFiltersBtn = document.getElementById('clearFilters');

// Modals
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');

// Footer year
const yearEl = document.getElementById('year');

// ------- Utilities -------
const currency = n => `₹${n.toFixed(2)}`;

function openModal(modal){ modal.setAttribute('aria-hidden','false'); }
function closeModal(modal){ modal.setAttribute('aria-hidden','true'); }

document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    closeModal(e.target.closest('.modal'));
  })
});

window.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    document.querySelectorAll('.modal').forEach(m=>closeModal(m));
  }
});

// ------- Renderers -------
function renderCatalog(items){
  grid.innerHTML = items.map(food=>cardTemplate(food)).join('');
  attachCardHandlers(grid);
}

function renderWishlist(){
  if(!wishlist.length){
    wishlistGrid.innerHTML = emptyState('Your wishlist is empty.');
    return;
  }
  const items = wishlist.map(id=>FOODS.find(f=>f.id===id)).filter(Boolean);
  wishlistGrid.innerHTML = items.map(food=>cardTemplate(food,true)).join('');
  attachCardHandlers(wishlistGrid);
}

function renderCart(){
  if(!cart.length){
    cartList.innerHTML = emptyState('Your cart is empty.');
    updateCartSummary();
    return;
  }
  cartList.innerHTML = cart.map(row=>{
    const f = FOODS.find(x=>x.id===row.id);
    return `<div class="cart-item">
      <img src="${f.image}" alt="${f.name}">
      <div class="meta">
        <h4>${f.name}</h4>
        <div class="sub">${f.serving} • ${f.calories} kcal • ${f.protein} g protein</div>
        <div class="price">${currency(f.price)} each</div>
      </div>
      <div class="qty" data-id="${f.id}">
        <button class="qty-dec">−</button>
        <span class="q">${row.qty}</span>
        <button class="qty-inc">+</button>
        <button class="remove icon-btn" title="Remove">Remove</button>
      </div>
    </div>`;
  }).join('');

  // qty handlers
  cartList.querySelectorAll('.qty-inc').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = +e.target.closest('.qty').dataset.id;
      changeQty(id, 1);
    })
  });
  cartList.querySelectorAll('.qty-dec').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = +e.target.closest('.qty').dataset.id;
      changeQty(id, -1);
    })
  });
  cartList.querySelectorAll('.remove').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = +e.target.closest('.qty').dataset.id;
      cart = cart.filter(x=>x.id!==id);
      persistCart();
      renderCart();
    })
  });

  updateCartSummary();
}

function updateCartSummary(){
  const items = cart.map(row=>({ ...FOODS.find(f=>f.id===row.id), qty: row.qty }));
  const totalItems = items.reduce((a,b)=>a+b.qty,0);
  const totalCalories = items.reduce((a,b)=>a + (b.calories*b.qty), 0);
  const totalProtein = items.reduce((a,b)=>a + (b.protein*b.qty), 0);
  const totalCarbs = items.reduce((a,b)=>a + (b.carbs*b.qty), 0);
  const totalFat = items.reduce((a,b)=>a + (b.fat*b.qty), 0);
  const totalPrice = items.reduce((a,b)=>a + (b.price*b.qty), 0);

  cartItemsCount.textContent = totalItems;
  cartCalories.textContent = totalCalories;
  cartProtein.textContent = totalProtein.toFixed(1);
  cartCarbs.textContent = totalCarbs.toFixed(1);
  cartFat.textContent = totalFat.toFixed(1);
  cartPrice.textContent = currency(totalPrice);
  cartCount.textContent = totalItems;
}

function emptyState(text){
  return `<div class="empty">${text}</div>`;
}

function cardTemplate(food, fromWishlist=false){
  const inWishlist = wishlist.includes(food.id);
  const inCart = cart.find(x=>x.id===food.id);
  return `<article class="card" data-id="${food.id}">
    <img class="card-img" src="${food.image}" alt="${food.name}">
    <div class="card-body">
      <div class="card-title">
        <h3>${food.name}</h3>
        <span class="pill">${titleCase(food.category)}</span>
      </div>
      <div class="nutrition">
        <div class="kpi"><span>Calories</span><strong>${food.calories}</strong></div>
        <div class="kpi"><span>Protein</span><strong>${food.protein} g</strong></div>
        <div class="kpi"><span>Carbs</span><strong>${food.carbs} g</strong></div>
        <div class="kpi"><span>Fat</span><strong>${food.fat} g</strong></div>
      </div>
      <div class="muted">Serving: ${food.serving}</div>
      <div class="price">${currency(food.price)}</div>
      <div class="card-actions">
        <button class="icon-btn btn-wishlist ${inWishlist?'active':''}" title="Add to wishlist">❤</button>
        <button class="icon-btn btn-add ${inCart?'active':''}" title="Add to cart">＋</button>
      </div>
    </div>
  </article>`
}

function titleCase(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

function attachCardHandlers(root){
  root.querySelectorAll('.card').forEach(card=>{
    const id = +card.dataset.id;
    card.querySelector('.btn-wishlist').addEventListener('click', ()=>toggleWishlist(id));
    card.querySelector('.btn-add').addEventListener('click', ()=>addToCart(id));
  });
}

// ------- Actions -------
function toggleWishlist(id){
  if(wishlist.includes(id)){
    wishlist = wishlist.filter(x=>x!==id);
  } else {
    wishlist.push(id);
  }
  persistWishlist();
  renderCatalog(applyFilters());
  renderWishlist();
}

function addToCart(id){
  const row = cart.find(x=>x.id===id);
  if(row){ row.qty += 1; }
  else { cart.push({id, qty:1}); }
  persistCart();
  renderCart();
  renderCatalog(applyFilters());
}

function changeQty(id, delta){
  const row = cart.find(x=>x.id===id);
  if(!row) return;
  row.qty += delta;
  if(row.qty<=0){ cart = cart.filter(x=>x.id!==id); }
  persistCart();
  renderCart();
}

function persistWishlist(){ store.set('hb_wishlist', wishlist); wishlistCount.textContent = wishlist.length; }
function persistCart(){ store.set('hb_cart', cart); cartCount.textContent = cart.reduce((a,b)=>a+b.qty,0); }

// ------- Filters Logic -------
function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;
  const cMin = calMin.value ? parseInt(calMin.value,10) : -Infinity;
  const cMax = calMax.value ? parseInt(calMax.value,10) : Infinity;
  const pMin = proteinMin.value ? parseInt(proteinMin.value,10) : -Infinity;

  return FOODS.filter(f=>{
    const matchesText = !q || f.name.toLowerCase().includes(q);
    const matchesCat = cat==='all' || f.category===cat;
    const matchesCal = f.calories>=cMin && f.calories<=cMax;
    const matchesProt = f.protein>=pMin;
    return matchesText && matchesCat && matchesCal && matchesProt;
  });
}

function updateCatalog(){
  renderCatalog(applyFilters());
}

// ------- Login (demo) -------
function updateLoginUI(){
  if(user){
    loginBtn.textContent = `Hi, ${user.email.split('@')[0]}`;
    loginBtn.classList.add('btn-outline');
  } else {
    loginBtn.textContent = 'Login';
    loginBtn.classList.remove('btn-outline');
  }
}

loginBtn.addEventListener('click', ()=>{
  if(user){
    const yes = confirm('Log out?');
    if(yes){ user=null; store.set('hb_user', null); updateLoginUI(); }
  } else {
    openModal(loginModal);
  }
});

loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if(password.length < 6){ alert('Password must be at least 6 characters.'); return; }
  user = { email };
  store.set('hb_user', user);
  closeModal(loginModal);
  updateLoginUI();
  alert('Logged in successfully (demo).');
});

// ------- Checkout (demo order) -------
checkoutBtn.addEventListener('click', ()=>{
  if(!cart.length){ alert('Your cart is empty.'); return; }
  openModal(checkoutModal);
});

checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = {
    name: document.getElementById('fullName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    postal: document.getElementById('postal').value.trim(),
    items: cart
  };
  alert(`Thank you, ${data.name}! Your healthy order is placed. (Demo)`);
  cart = [];
  persistCart();
  renderCart();
  closeModal(checkoutModal);
});

// ------- Filter Events -------
[searchInput, categorySelect, calMin, calMax, proteinMin].forEach(el=>{
  el.addEventListener('input', updateCatalog);
});

clearFiltersBtn.addEventListener('click', ()=>{
  searchInput.value='';
  categorySelect.value='all';
  calMin.value='';
  calMax.value='';
  proteinMin.value='';
  updateCatalog();
});

// Clear wishlist / cart
const clearWishlistBtn = document.getElementById('clearWishlist');
clearWishlistBtn.addEventListener('click', ()=>{
  wishlist = [];
  persistWishlist();
  renderWishlist();
  renderCatalog(applyFilters());
});

const clearCartBtn = document.getElementById('clearCart');
clearCartBtn.addEventListener('click', ()=>{
  if(confirm('Clear all items from cart?')){
    cart = [];
    persistCart();
    renderCart();
    renderCatalog(applyFilters());
  }
});

// ------- Init -------
function init(){
  yearEl.textContent = new Date().getFullYear();
  wishlistCount.textContent = wishlist.length;
  cartCount.textContent = cart.reduce((a,b)=>a+b.qty,0);
  renderCatalog(FOODS);
  renderWishlist();
  renderCart();
  updateLoginUI();
}

init();
