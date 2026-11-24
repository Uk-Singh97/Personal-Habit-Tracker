/* CSE 326: Personal Habit Tracker | Team Galacticos | script.js */
let habits = [];
let currentUser = null;
let isRegisterMode = false;

window.onload = function() {
  initDefaultAccounts();
  checkAuth();
};

// Seed demo account if no accounts exist
function initDefaultAccounts() {
  if (!localStorage.getItem('habitAccounts')) {
    localStorage.setItem('habitAccounts', JSON.stringify({ "demo": "1234" }));
  }
}

// Check login session
function checkAuth() {
  currentUser = localStorage.getItem('habitUser');
  const authSec = document.getElementById('authSection');
  const appSec = document.getElementById('appSection');
  const userBar = document.getElementById('userBar');

  if (currentUser) {
    authSec.style.display = 'none';
    appSec.style.display = 'block';
    userBar.style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = currentUser;
    loadHabits();
  } else {
    authSec.style.display = 'block';
    appSec.style.display = 'none';
    userBar.style.display = 'none';
  }
}

// Toggle between Login and Registration
function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('authTitle').textContent = isRegisterMode ? 'Register New Account' : 'User Login';
  document.getElementById('authSubtitle').textContent = isRegisterMode 
    ? 'Create an account to save your habits securely.' 
    : 'Login with your username & password to access your habits.';
  document.getElementById('authSubmitBtn').textContent = isRegisterMode ? 'Sign Up' : 'Login';
  document.getElementById('toggleAuthBtn').textContent = isRegisterMode ? 'Already have an account? Login' : 'Create New Account';
  document.getElementById('authForm').reset();
}

// Handle Login & Registration with saved password verification
function handleAuth(e) {
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (!user || !pass) return alert('Please enter both username and password!');
  let accounts = JSON.parse(localStorage.getItem('habitAccounts')) || {};

  if (isRegisterMode) {
    if (accounts[user]) return alert('Username already exists! Please login.');
    accounts[user] = pass;
    localStorage.setItem('habitAccounts', JSON.stringify(accounts));
    localStorage.setItem('habits_' + user, JSON.stringify([]));
    alert('Account created successfully! Logging you in...');
    localStorage.setItem('habitUser', user);
    checkAuth();
  } else {
    if (!accounts[user]) return alert('Account not found! Click "Create New Account" to register.');
    if (accounts[user] !== pass) return alert('Incorrect password! Please try again.');
    localStorage.setItem('habitUser', user);
    checkAuth();
  }
}

// Logout user
function logoutUser() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('habitUser');
    checkAuth();
  }
}

// Load and save user-specific habits
function loadHabits() {
  const saved = localStorage.getItem('habits_' + currentUser);
  habits = saved ? JSON.parse(saved) : [];
  renderHabits();
}

function saveToStorage() {
  localStorage.setItem('habits_' + currentUser, JSON.stringify(habits));
}

// Add or Update Habit
function saveHabit(e) {
  e.preventDefault();
  const title = document.getElementById('habitTitle').value.trim();
  const category = document.getElementById('habitCategory').value;
  const priority = document.getElementById('habitPriority').value;
  const schedule = document.getElementById('habitSchedule').value;
  const editIndex = parseInt(document.getElementById('editIndex').value);

  if (!title) return alert('Please enter a habit name!');

  if (editIndex === -1) {
    habits.push({ id: Date.now(), title, category, priority, schedule, completed: false });
  } else {
    habits[editIndex].title = title;
    habits[editIndex].category = category;
    habits[editIndex].priority = priority;
    habits[editIndex].schedule = schedule;
    cancelEdit();
  }
  saveToStorage();
  renderHabits();
  document.getElementById('habitForm').reset();
}

// Populate form for editing
function editHabit(index) {
  const h = habits[index];
  document.getElementById('habitTitle').value = h.title;
  document.getElementById('habitCategory').value = h.category;
  document.getElementById('habitPriority').value = h.priority;
  document.getElementById('habitSchedule').value = h.schedule;
  document.getElementById('editIndex').value = index;

  document.getElementById('formTitle').textContent = 'Edit Habit';
  document.getElementById('submitBtn').textContent = 'Update Habit';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

function cancelEdit() {
  document.getElementById('habitForm').reset();
  document.getElementById('editIndex').value = -1;
  document.getElementById('formTitle').textContent = 'Add New Habit';
  document.getElementById('submitBtn').textContent = 'Add Habit';
  document.getElementById('cancelBtn').style.display = 'none';
}

function toggleHabit(index) {
  habits[index].completed = !habits[index].completed;
  saveToStorage();
  renderHabits();
}

function deleteHabit(index) {
  if (confirm('Delete this habit?')) {
    habits.splice(index, 1);
    saveToStorage();
    renderHabits();
  }
}

// Render habit list and filters
function renderHabits() {
  const list = document.getElementById('habitList');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const fCat = document.getElementById('filterCategory').value;
  const fStat = document.getElementById('filterStatus').value;
  list.innerHTML = '';

  const filtered = habits.filter(h => {
    const matchSearch = h.title.toLowerCase().includes(search);
    const matchCat = (fCat === 'All') || (h.category === fCat);
    const matchStat = (fStat === 'All') || (fStat === 'Completed' && h.completed) || (fStat === 'Pending' && !h.completed);
    return matchSearch && matchCat && matchStat;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-msg">No habits found. Add your habit above to start tracking!</div>';
  } else {
    filtered.forEach(habit => {
      const idx = habits.indexOf(habit);
      const card = document.createElement('div');
      card.className = 'habit-card ' + (habit.completed ? 'completed' : '');
      card.innerHTML = `
        <div class="habit-info">
          <h3 class="habit-title">${habit.title}</h3>
          <div class="meta-tags">
            <span class="badge badge-category">${habit.category}</span>
            <span class="badge badge-priority-${habit.priority}">${habit.priority}</span>
            <span class="badge badge-schedule">${habit.schedule}</span>
          </div>
        </div>
        <div class="habit-actions">
          <button class="btn-sm ${habit.completed ? 'btn-undo' : 'btn-check'}" onclick="toggleHabit(${idx})">${habit.completed ? 'Undo' : 'Done'}</button>
          <button class="btn-sm btn-edit" onclick="editHabit(${idx})">Edit</button>
          <button class="btn-sm btn-del" onclick="deleteHabit(${idx})">Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
  }
  updateDashboard();
}

// Update dashboard metrics
function updateDashboard() {
  const total = habits.length;
  const completed = habits.filter(h => h.completed).length;
  const pending = total - completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('totalCount').textContent = total;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('progressPercent').textContent = pct + '%';
  document.getElementById('progressBar').style.width = pct + '%';
}
