// Store users in localStorage
const users = JSON.parse(localStorage.getItem('users')) || [];

// DOM Elements
const authContainer = document.getElementById('authContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const profileOverlay = document.getElementById('profileOverlay');
const closeProfile = document.getElementById('closeProfile');
const closeBtn = document.querySelector('.close-btn');
const signInBtn = document.querySelector('.signin');
const logoutBtn = document.getElementById('logoutBtn');
const profileLink = document.getElementById('profileLink');
const logoutLink = document.getElementById('logoutLink');

// Show/Hide authentication elements based on login state
function updateAuthUI(isLoggedIn, userData = null) {
    if (isLoggedIn && userData) {
        logoutBtn.style.display = 'flex';
        profileLink.style.display = 'flex';
        signInBtn.textContent = userData.name || userData.email;
        signInBtn.style.backgroundColor = '#00008d';
        signInBtn.style.color = 'white';
        signInBtn.style.border = 'none';
    } else {
        logoutBtn.style.display = 'none';
        profileLink.style.display = 'none';
        signInBtn.textContent = 'Sign In';
        signInBtn.style = '';
    }
}

// Profile Management

// Profile Management
profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                       JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser) {
        showProfile(currentUser);
    } else {
        alert('Please login to view your profile');
        authContainer.style.display = 'flex';
        toggleForm('login');
    }
});

closeProfile.addEventListener('click', () => {
    profileOverlay.style.display = 'none';
});

profileOverlay.addEventListener('click', (e) => {
    if (e.target === profileOverlay) {
        profileOverlay.style.display = 'none';
    }
});

// Show Profile Information
function showProfile(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileJoinDate').textContent = user.joinDate || 'Not available';
    document.getElementById('profileBlogCount').textContent = user.blogCount || 0;
    
    profileOverlay.style.display = 'flex';
}

// Handle Logout
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Clear user data
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    
    // Update UI
    document.querySelector('.signin').textContent = 'Sign In';
    document.querySelector('.signin').style = '';
    
    // Hide profile elements
    logoutBtn.style.display = 'none';
    
    alert('Logged out successfully!');
});

// Edit Profile Function
function showEditProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                       JSON.parse(sessionStorage.getItem('currentUser'));
    
    const newName = prompt('Enter new name:', currentUser.name);
    if (newName && newName.trim()) {
        // Update user in storage
        currentUser.name = newName.trim();
        updateUserData(currentUser);
        
        // Update UI
        document.getElementById('profileName').textContent = newName;
        document.querySelector('.signin').textContent = newName;
        alert('Profile updated successfully!');
    }
}

// Change Password Function
function showChangePassword() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                       JSON.parse(sessionStorage.getItem('currentUser'));
    
    const currentPassword = prompt('Enter current password:');
    if (currentPassword === currentUser.password) {
        const newPassword = prompt('Enter new password:');
        if (newPassword && newPassword.length >= 6) {
            const confirmPassword = prompt('Confirm new password:');
            if (newPassword === confirmPassword) {
                // Update password
                currentUser.password = newPassword;
                updateUserData(currentUser);
                alert('Password changed successfully!');
            } else {
                alert('Passwords do not match!');
            }
        } else {
            alert('Password must be at least 6 characters long!');
        }
    } else {
        alert('Incorrect current password!');
    }
}

// Update user data in storage
function updateUserData(currentUser) {
    // Update in users array
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Update in current session
    if (localStorage.getItem('rememberMe') === 'true') {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Auth Container Functions

// Show/Hide auth container
function toggleAuthContainer(show) {
    authContainer.style.display = show ? 'flex' : 'none';
}

// Toggle between forms
function toggleForm(formType) {
    const forgotForm = document.getElementById('forgotForm');
    
    // Hide all forms first
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    forgotForm.classList.remove('active');

    // Show the requested form
    switch(formType) {
        case 'login':
            loginForm.classList.add('active');
            break;
        case 'register':
            registerForm.classList.add('active');
            break;
        case 'forgot':
            forgotForm.classList.add('active');
            break;
    }
}

// Event Listeners
signInBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthContainer(true);
    toggleForm('login');
});

closeBtn.addEventListener('click', () => {
    toggleAuthContainer(false);
});

authContainer.addEventListener('click', (e) => {
    if (e.target === authContainer) {
        toggleAuthContainer(false);
    }
});

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store user data
        if (rememberMe) {
            // Store in localStorage for persistent login
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('rememberMe', 'true');
        } else {
            // Store in sessionStorage for temporary login
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('currentUser');
        }
        
        alert('Login successful!');
        document.getElementById('authContainer').style.display = 'none';
        updateAuthUI(true, user);
    } else {
        alert('Invalid email or password!');
    }
    return false;
}

// Handle Forgot Password
function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;
    
    // Check if email exists in users array
    const user = users.find(u => u.email === email);
    
    if (user) {
        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // Update user's password
        user.password = tempPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // In a real application, you would send this via email
        alert(`For demonstration purposes: Your temporary password is: ${tempPassword}\nPlease login with this password and change it immediately.`);
        
        toggleForm('login');
    } else {
        alert('No account found with this email address.');
    }
    return false;
}

// Handle Registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return false;
    }

    const newUser = {
        name,
        email,
        password,
        joinDate: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    toggleForm('login');
    return false;
}

// Check login state on page load
window.addEventListener('load', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                       JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        updateAuthUI(true, currentUser);
    } else {
        updateAuthUI(false);
    }
});

// Handle Logout

function handleLogout(event) {
    event.preventDefault();
    
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    
    // Reset UI
    signInBtn.textContent = 'Sign In';
    signInBtn.style.backgroundColor = '';
    signInBtn.style.color = '';
    signInBtn.style.border = '2px solid #000000';
    
    // Hide logout link until next login
    toggleLogoutVisibility(false);
    
    alert('Logged out successfully!');
}

function toggleLogoutVisibility(show) {
    logoutLink.style.display = show ? 'flex' : 'none';
}

// Add logout event listener
logoutLink.addEventListener('click', handleLogout);

// Update UI after login to include logout visibility
function updateUIAfterLogin(user) {
    signInBtn.textContent = user.name;
    signInBtn.style.backgroundColor = '#00008d';
    signInBtn.style.color = 'white';
    signInBtn.style.border = 'none';
    toggleLogoutVisibility(true);
}

// Check if user is already logged in
window.addEventListener('load', () => {
    // Check both localStorage and sessionStorage for logged in user
    const rememberedUser = JSON.parse(localStorage.getItem('currentUser'));
    const sessionUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const currentUser = rememberedUser || sessionUser;

    if (currentUser) {
        updateUIAfterLogin(currentUser);
        
        // If user was remembered, check the remember me box by default next time
        if (localStorage.getItem('rememberMe') === 'true') {
            document.getElementById('rememberMe').checked = true;
        }
    } else {
        toggleLogoutVisibility(false);
    }
    
    // Set initial form state
    loginForm.classList.add('active');
});
