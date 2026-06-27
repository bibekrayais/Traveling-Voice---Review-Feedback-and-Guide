/*
 * ================================================================
 * TRAVELVOICE - AUTH & ACCESS CONTROL SYSTEM
 * ================================================================
 *
 * HOW ADMIN ACCESS WORKS (read this to understand):
 *
 * 1. On signup, users choose their role: "User" or "Admin".
 *    - To sign up as Admin, you must enter the secret code: ADMIN2024
 *    - This prevents random users from making themselves admin.
 *
 * 2. User accounts are stored in localStorage under "tv_users".
 *    - Format: [{ name, email, password, role }, ...]
 *
 * 3. When logged in, the current user is stored in "tv_currentUser".
 *    - Format: { name, email, role }
 *
 * 4. On every page load, the app checks:
 *    - Is someone logged in? (check localStorage "tv_currentUser")
 *    - Is their role "admin"?
 *    - If YES → show the Dashboard section and Dashboard nav link
 *    - If NO → Dashboard stays hidden (display:none in CSS)
 *
 * 5. The Dashboard section in HTML has class "dashboard-section".
 *    - CSS: .dashboard-section { display: none !important; }
 *    - JS:  .dashboard-section.classList.add("visible") → display:block
 *
 * 6. The Dashboard nav link has class "nav-admin".
 *    - CSS: .nav-admin { display: none; }
 *    - JS:  .nav-admin.style.display = "inline" / "block"
 *
 * 7. Even if a regular user types #dashboard in the URL bar,
 *    the section stays hidden because the CSS display:none is
 *    only overridden by the "visible" class (added by JS for admins).
 *
 * TO LOGIN AS ADMIN (quick access for testing):
 *   Email:    admin@travelvoice.com
 *   Password: admin123
 * ================================================================
 */

// ==================== USERS STORAGE ====================

function getUsers() {
    const data = localStorage.getItem('tv_users');
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem('tv_users', JSON.stringify(users));
}

function getCurrentUser() {
    const data = localStorage.getItem('tv_currentUser');
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('tv_currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('tv_currentUser');
}

// Seed a default admin account if none exists
(function seedAdmin() {
    const users = getUsers();
    if (!users.find(u => u.email === 'admin@travelvoice.com')) {
        users.push({
            name: 'Admin',
            email: 'admin@travelvoice.com',
            password: 'admin123',
            role: 'admin'
        });
        saveUsers(users);
    }
})();

// ==================== UI HELPERS ====================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#nav-menu a');

function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 150;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// ==================== MODAL SYSTEM ====================

const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ==================== TOAST SYSTEM ====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('complaintToast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ==================== DARK MODE ====================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

function getTheme() {
    return localStorage.getItem('tv_theme') || 'light';
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
    }
    localStorage.setItem('tv_theme', theme);
}

// Apply saved theme on page load
setTheme(getTheme());

themeToggle.addEventListener('click', () => {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// ==================== AUTH UI (Login/Signup + User Badge) ====================

const authButtons = document.getElementById('authButtons');
const userBadge = document.getElementById('userBadge');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleBadge = document.getElementById('userRoleBadge');

function updateAuthUI() {
    const user = getCurrentUser();
    if (user) {
        authButtons.style.display = 'none';
        userBadge.style.display = 'flex';
        userNameDisplay.textContent = user.name;
        userRoleBadge.textContent = user.role;
        userRoleBadge.className = 'user-role-badge role-' + user.role;
    } else {
        authButtons.style.display = 'flex';
        userBadge.style.display = 'none';
    }
    updateDashboardAccess();
}

// ==================== ADMIN ACCESS CONTROL ====================

function updateDashboardAccess() {
    const user = getCurrentUser();
    const dashboardSection = document.getElementById('dashboard');
    const navDashboard = document.getElementById('navDashboard');

    if (user && user.role === 'admin') {
        // Admin: show dashboard section and nav link
        dashboardSection.classList.add('visible');
        navDashboard.style.display = 'inline';
    } else {
        // Regular user or guest: hide dashboard
        dashboardSection.classList.remove('visible');
        navDashboard.style.display = 'none';
    }
}

// ==================== SIGNUP ====================

document.getElementById('signupBtn').addEventListener('click', () => {
    openModal(`
        <h2 style="margin-bottom:24px;text-align:center;">Create Account</h2>
        <form id="signupForm">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Full Name</label>
                <input type="text" id="signupName" placeholder="John Doe" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="signupEmail" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="signupPassword" placeholder="Create a password" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-user-tag"></i> Role</label>
                <select id="signupRole" style="width:100%;padding:14px 16px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:.95rem;background:var(--input-bg);color:var(--text);font-family:inherit;">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="form-group" id="adminCodeGroup" style="display:none;">
                <label><i class="fas fa-shield-alt"></i> Admin Secret Code</label>
                <input type="password" id="adminCode" placeholder="Enter admin secret code">
                <p style="font-size:.8rem;color:var(--text-light);margin-top:6px;">Ask your administrator for the secret code.</p>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Create Account</button>
            <p style="text-align:center;margin-top:16px;color:var(--text-light);font-size:.85rem;">
                Already have an account? <a href="#" id="switchToLogin" style="color:var(--primary);font-weight:600;">Login</a>
            </p>
        </form>
    `);

    // Show/hide admin code field based on role selection
    document.getElementById('signupRole').addEventListener('change', function() {
        document.getElementById('adminCodeGroup').style.display = this.value === 'admin' ? 'block' : 'none';
    });

    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;
        const adminCode = document.getElementById('adminCode')?.value || '';

        // Validate admin secret code
        if (role === 'admin' && adminCode !== 'ADMIN2024') {
            showToast('Invalid admin secret code. Try ADMIN2024', 'error');
            return;
        }

        const users = getUsers();
        if (users.find(u => u.email === email)) {
            showToast('An account with this email already exists.', 'error');
            return;
        }

        users.push({ name, email, password, role });
        saveUsers(users);
        closeModal();
        showToast('Account created! You can now login.', 'success');
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        document.getElementById('loginBtn').click();
    });
});

// ==================== LOGIN ====================

document.getElementById('loginBtn').addEventListener('click', () => {
    openModal(`
        <h2 style="margin-bottom:24px;text-align:center;">Welcome Back</h2>
        <form id="loginForm">
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="loginEmail" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Login</button>
            <p style="text-align:center;margin-top:16px;color:var(--text-light);font-size:.85rem;">
                Don't have an account? <a href="#" id="switchToSignup" style="color:var(--primary);font-weight:600;">Sign Up</a>
            </p>
            <p style="text-align:center;margin-top:8px;color:var(--text-light);font-size:.75rem;">
                Admin demo: admin@travelvoice.com / admin123
            </p>
        </form>
    `);

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showToast('Invalid email or password.', 'error');
            return;
        }

        setCurrentUser({ name: user.name, email: user.email, role: user.role });
        closeModal();
        updateAuthUI();
        showToast('Logged in as ' + user.name + ' (' + user.role + ')', 'success');
    });

    document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        document.getElementById('signupBtn').click();
    });
});

// ==================== LOGOUT ====================

document.getElementById('logoutBtn').addEventListener('click', () => {
    clearCurrentUser();
    updateAuthUI();
    showToast('Logged out successfully.', 'success');
});

// ==================== SEARCH ====================

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');

const places = [
    { name: 'Hotel Himalayan', category: 'Hotels', location: 'Pokhara', rating: 4.6 },
    { name: 'Mo:Mo Station', category: 'Restaurants', location: 'Lakeside', rating: 4.3 },
    { name: 'Sarangkot View Point', category: 'Attractions', location: 'Pokhara', rating: 4.8 },
    { name: 'Peace Stupa', category: 'Attractions', location: 'Anadu Hill', rating: 4.7 },
    { name: 'Pokhara Bus Terminal', category: 'Transport', location: 'Pokhara', rating: 3.2 },
    { name: 'City Taxi Service', category: 'Transport', location: 'Pokhara', rating: 4.0 },
    { name: 'Local Guide Ram', category: 'Guides', location: 'Lakeside', rating: 4.5 },
    { name: 'Mountain Trek Guides', category: 'Guides', location: 'Annapurna', rating: 4.9 },
    { name: 'Lake View Restaurant', category: 'Restaurants', location: 'Pokhara', rating: 4.2 },
    { name: 'Fewa Park', category: 'Attractions', location: 'Pokhara', rating: 4.1 },
];

function searchPlace(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        searchResults.classList.remove('show');
        return;
    }
    const matches = places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
        searchResults.innerHTML = '<p style="color:var(--text-light);text-align:center;">No results found. Try a different search.</p>';
    } else {
        searchResults.innerHTML = matches.map(p => `
            <div class="search-result-item">
                <h4>${p.name}</h4>
                <p>${p.category} &middot; ${p.location} &middot; ⭐ ${p.rating}</p>
            </div>
        `).join('');
    }
    searchResults.classList.add('show');
}

searchBtn.addEventListener('click', () => searchPlace(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchPlace(searchInput.value);
});

// Category click
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        searchInput.value = category;
        searchPlace(category);
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
    });
});

// ==================== REVIEW BUTTONS ====================

document.querySelectorAll('.review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const place = btn.dataset.place;
        openModal(`
            <h2 style="margin-bottom:24px;text-align:center;">Write a Review</h2>
            <form id="reviewForm">
                <div class="form-group">
                    <label><i class="fas fa-store"></i> Place</label>
                    <input type="text" value="${place}" readonly style="background:var(--input-bg);">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-star"></i> Rating</label>
                    <div style="font-size:1.6rem;cursor:pointer;" id="starRating">
                        <span data-star="1">☆</span>
                        <span data-star="2">☆</span>
                        <span data-star="3">☆</span>
                        <span data-star="4">☆</span>
                        <span data-star="5">☆</span>
                    </div>
                    <input type="hidden" id="ratingValue" value="0">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-pen"></i> Your Review</label>
                    <textarea placeholder="Share your experience..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Submit Review</button>
            </form>
        `);
        let selectedRating = 0;
        const stars = document.querySelectorAll('#starRating span');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.star);
                document.getElementById('ratingValue').value = selectedRating;
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                });
            });
            star.addEventListener('mouseenter', () => {
                const hover = parseInt(star.dataset.star);
                stars.forEach((s, i) => {
                    s.textContent = i < hover ? '★' : '☆';
                });
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                });
            });
        });
        document.getElementById('reviewForm').addEventListener('submit', function(e) {
            e.preventDefault();
            if (selectedRating === 0) {
                showToast('Please select a rating.', 'error');
                return;
            }
            closeModal();
            showToast('Review for ' + place + ' submitted! Thank you.', 'success');
        });
    });
});

// ==================== COMPLAINT FORM ====================

document.getElementById('complaintForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('complaintName').value;
    const title = document.getElementById('complaintTitle').value;
    const body = document.getElementById('complaintBody').value;
    if (!name || !title || !body) {
        showToast('Please fill in all fields.', 'error');
        return;
    }
    const lastId = document.querySelector('#complaintTable tbody tr:first-child td:first-child .badge-id');
    let newNum = 1255;
    if (lastId) {
        newNum = parseInt(lastId.textContent.replace('#', '')) + 1;
    }
    const tableBody = document.querySelector('#complaintTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><span class="badge-id">#${newNum}</span></td>
        <td>${title}</td>
        <td>${document.getElementById('complaintPlace').value}</td>
        <td><span class="status status-pending">Pending</span></td>
        <td><button class="btn btn-sm btn-green resolve-btn" data-id="#${newNum}">Resolve</button></td>
    `;
    tableBody.prepend(newRow);
    updateStats();
    newRow.querySelector('.resolve-btn').addEventListener('click', resolveComplaint);
    this.reset();
    showToast('Complaint submitted successfully! ID: #' + newNum, 'success');
});

// ==================== RESOLVE COMPLAINTS ====================

function resolveComplaint() {
    const btn = this;
    const row = btn.closest('tr');
    const statusCell = row.querySelector('.status');
    statusCell.className = 'status status-resolved';
    statusCell.textContent = 'Resolved';
    btn.textContent = 'Resolved';
    btn.disabled = true;
    btn.className = 'btn btn-sm btn-outline';
    updateStats();
    showToast('Complaint ' + row.querySelector('.badge-id').textContent + ' marked as resolved.', 'success');
}

document.querySelectorAll('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', resolveComplaint);
});

function updateStats() {
    const rows = document.querySelectorAll('#complaintTable tbody tr');
    const total = rows.length;
    const pending = document.querySelectorAll('#complaintTable .status-pending').length;
    const resolved = total - pending;
    document.getElementById('totalComplaints').textContent = total.toLocaleString();
    document.getElementById('pendingComplaints').textContent = pending.toLocaleString();
    document.getElementById('resolvedComplaints').textContent = resolved.toLocaleString();
}

// ==================== INIT ====================

// Apply auth state on page load
updateAuthUI();