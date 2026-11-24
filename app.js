/* Shared Application Logic - Team Galacticos Habit Hub | app.js */
const defaultCatalogue = [
  { id: 1, name: "DSA & Problem Solving", category: "Study", priority: "High", time: "45 mins", desc: "Solve 2 algorithmic coding problems daily." },
  { id: 2, name: "Morning Jog & Cardio", category: "Fitness", priority: "High", time: "30 mins", desc: "Outdoor jogging or skipping for cardiovascular endurance." },
  { id: 3, name: "Mindful Meditation", category: "Health", priority: "Medium", time: "15 mins", desc: "Breathwork and quiet reflection for focus." },
  { id: 4, name: "Technical Article Reading", category: "Study", priority: "Medium", time: "20 mins", desc: "Read engineering blogs and research papers in technology." },
  { id: 5, name: "Full Body Core Workout", category: "Fitness", priority: "High", time: "35 mins", desc: "Push-ups, planks, and squats for strength." },
  { id: 6, name: "Daily Goal Review & Journal", category: "Productivity", priority: "Low", time: "10 mins", desc: "Review accomplishments and prepare tomorrow's plan." }
];

function initStorage() {
  if (!localStorage.getItem('habitCatalogue')) localStorage.setItem('habitCatalogue', JSON.stringify(defaultCatalogue));
  if (!localStorage.getItem('routineCart')) localStorage.setItem('routineCart', JSON.stringify([]));
  if (!localStorage.getItem('habitReviews')) {
    localStorage.setItem('habitReviews', JSON.stringify([
      { name: "Rahul S.", habit: "DSA Practice", rating: 5, text: "Helped me stay consistent with coding interviews!" },
      { name: "Ananya M.", habit: "Morning Jog", rating: 5, text: "Great energy boost before morning classes." }
    ]));
  }
}

function initNav() {
  initStorage();
  const cart = JSON.parse(localStorage.getItem('routineCart')) || [];
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.length;
  const authLink = document.getElementById('authLink');
  const user = localStorage.getItem('portalUser');
  if (authLink) {
    authLink.innerHTML = user ? `<span style="color:#a5b4fc">Hi, ${user}</span> <a href="#" onclick="logout()" style="color:#ef4444;margin-left:6px">(Logout)</a>` : `<a href="login.html">Login</a>`;
  }
}

// Page 1 (index.html): Catalogue & Filter
let currentCategory = 'All';
function renderCatalogue(cat = currentCategory) {
  currentCategory = cat;
  const catalogue = JSON.parse(localStorage.getItem('habitCatalogue')) || [];
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const grid = document.getElementById('catalogueGrid');
  if (!grid) return;
  const filtered = catalogue.filter(h => ((cat === 'All') || (h.category === cat)) && (h.name.toLowerCase().includes(search) || h.desc.toLowerCase().includes(search)));
  document.querySelectorAll('.pill').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === cat));
  grid.innerHTML = filtered.length ? filtered.map(h => `
    <div class="card">
      <span class="badge badge-${h.category}">${h.category}</span>
      <h3>${h.name}</h3><p>${h.desc}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.8rem;color:#64748b;font-weight:600">⏱️ ${h.time} | ${h.priority}</span>
        <button class="btn btn-primary" onclick="addToRoutine(${h.id})">+ Add Routine</button>
      </div>
    </div>`).join('') : '<p style="text-align:center;grid-column:1/-1;color:#64748b">No habits found.</p>';
}

function addToRoutine(id) {
  const catalogue = JSON.parse(localStorage.getItem('habitCatalogue')) || [];
  const cart = JSON.parse(localStorage.getItem('routineCart')) || [];
  const item = catalogue.find(h => h.id === id);
  if (!item || cart.some(h => h.id === id)) return alert('Already in your active routine!');
  cart.push(item);
  localStorage.setItem('routineCart', JSON.stringify(cart));
  initNav();
  alert(`"${item.name}" added to your Active Routine!`);
}

// Page 2 (routine.html): Routine List
function renderRoutine() {
  const cart = JSON.parse(localStorage.getItem('routineCart')) || [];
  const body = document.getElementById('routineTableBody');
  const summary = document.getElementById('routineSummary');
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#64748b">No habits in your routine. <a href="index.html" style="color:#4f46e5;font-weight:600">Explore Catalogue</a></td></tr>`;
    if (summary) summary.innerHTML = '';
    return;
  }
  body.innerHTML = cart.map((h, i) => `<tr><td>${i + 1}</td><td><strong>${h.name}</strong></td><td><span class="badge badge-${h.category}">${h.category}</span></td><td>${h.time}</td><td><button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem" onclick="removeFromRoutine(${h.id})">Remove</button></td></tr>`).join('');
  if (summary) summary.innerHTML = `<div class="card" style="margin-top:18px;display:flex;justify-content:space-between;align-items:center"><div><strong>Selected Habits:</strong> ${cart.length}</div><a href="pledge.html" class="btn btn-primary">Proceed to Goal Pledge &rarr;</a></div>`;
}

function removeFromRoutine(id) {
  let cart = JSON.parse(localStorage.getItem('routineCart')) || [];
  localStorage.setItem('routineCart', JSON.stringify(cart.filter(h => h.id !== id)));
  initNav();
  renderRoutine();
}

// Page 3 (pledge.html): Pledge Pass
function handleCommitment(e) {
  e.preventDefault();
  const cart = JSON.parse(localStorage.getItem('routineCart')) || [];
  if (!cart.length) return alert('Your routine is empty! Please add habits first.');
  const name = document.getElementById('studentName').value.trim();
  const id = document.getElementById('studentId').value.trim();
  const duration = document.getElementById('goalDuration').value;
  const time = document.getElementById('reminderTime').value;
  const pledgeId = 'PLG-' + Date.now().toString().slice(-5);
  const receipt = document.getElementById('receiptBox');
  document.getElementById('pledgeForm').style.display = 'none';
  receipt.style.display = 'block';
  receipt.innerHTML = `
    <div style="text-align:center;margin-bottom:10px">
      <h2 style="color:#4f46e5;font-size:1.3rem">Official Habit Commitment Pass</h2>
      <p style="font-size:0.8rem;color:#64748b">Pledge ID: <strong>${pledgeId}</strong> | Team Galacticos</p>
    </div>
    <hr style="border:none;border-top:1px dashed #cbd5e1;margin:10px 0">
    <p><strong>Student:</strong> ${name} (ID: ${id})</p><p><strong>Duration:</strong> ${duration} | <strong>Schedule:</strong> ${time}</p>
    <div style="margin:10px 0"><strong>Committed Habits:</strong><ul style="margin-left:20px;margin-top:4px">${cart.map(h => `<li>${h.name} (${h.time})</li>`).join('')}</ul></div>
    <hr style="border:none;border-top:1px dashed #cbd5e1;margin:10px 0">
    <button class="btn btn-success btn-block" onclick="window.print()">Print Commitment Pass</button>`;
  localStorage.setItem('routineCart', JSON.stringify([]));
  initNav();
}

// Page 4 (reviews.html): Reviews
function renderReviews() {
  const reviews = JSON.parse(localStorage.getItem('habitReviews')) || [];
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;
  grid.innerHTML = reviews.map(r => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong>${r.name}</strong><span style="color:#eab308">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
      <div style="font-size:0.8rem;color:#4f46e5;font-weight:600;margin-bottom:4px">Habit: ${r.habit}</div><p style="margin:0">${r.text}</p>
    </div>`).join('');
}

function addReview(e) {
  e.preventDefault();
  const name = document.getElementById('revName').value.trim();
  const habit = document.getElementById('revHabit').value.trim();
  const rating = parseInt(document.getElementById('revRating').value);
  const text = document.getElementById('revText').value.trim();
  const reviews = JSON.parse(localStorage.getItem('habitReviews')) || [];
  reviews.unshift({ name, habit, rating, text });
  localStorage.setItem('habitReviews', JSON.stringify(reviews));
  document.getElementById('reviewForm').reset();
  renderReviews();
  alert('Thank you! Your feedback has been posted.');
}

// Page 5 (admin.html): CRUD
function renderAdminTable() {
  const catalogue = JSON.parse(localStorage.getItem('habitCatalogue')) || [];
  const body = document.getElementById('adminTableBody');
  if (!body) return;
  body.innerHTML = catalogue.map((h, i) => `<tr><td>${i + 1}</td><td><strong>${h.name}</strong></td><td><span class="badge badge-${h.category}">${h.category}</span></td><td>${h.time} (${h.priority})</td><td><button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem" onclick="deleteAdminHabit(${h.id})">Delete</button></td></tr>`).join('');
}

function addAdminHabit(e) {
  e.preventDefault();
  const name = document.getElementById('admName').value.trim();
  const category = document.getElementById('admCategory').value;
  const priority = document.getElementById('admPriority').value;
  const time = document.getElementById('admTime').value.trim();
  const desc = document.getElementById('admDesc').value.trim();
  const catalogue = JSON.parse(localStorage.getItem('habitCatalogue')) || [];
  catalogue.push({ id: Date.now(), name, category, priority, time, desc });
  localStorage.setItem('habitCatalogue', JSON.stringify(catalogue));
  document.getElementById('addHabitForm').reset();
  renderAdminTable();
  alert('New habit added to master catalogue!');
}

function deleteAdminHabit(id) {
  if (!confirm('Delete habit from master catalogue?')) return;
  let catalogue = JSON.parse(localStorage.getItem('habitCatalogue')) || [];
  localStorage.setItem('habitCatalogue', JSON.stringify(catalogue.filter(h => h.id !== id)));
  renderAdminTable();
}

// Page 6 (login.html): Authentication
function handleAuth(e, type) {
  e.preventDefault();
  const user = document.getElementById(type + 'User').value.trim();
  const pass = document.getElementById(type + 'Pass').value.trim();
  let accounts = JSON.parse(localStorage.getItem('habitAccounts')) || { "demo": "1234" };
  if (type === 'reg') {
    if (accounts[user]) return alert('User already exists! Please login.');
    accounts[user] = pass;
    localStorage.setItem('habitAccounts', JSON.stringify(accounts));
    localStorage.setItem('portalUser', user);
    alert('Account created! Welcome to the portal.');
    window.location.href = 'index.html';
  } else {
    if (!accounts[user] || accounts[user] !== pass) return alert('Invalid credentials! Try again or register.');
    localStorage.setItem('portalUser', user);
    alert('Login successful!');
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('portalUser');
  initNav();
  window.location.reload();
}

window.addEventListener('DOMContentLoaded', initNav);
