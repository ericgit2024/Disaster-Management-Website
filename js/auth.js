/**
 * Authentication handling for DisasterGuard
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth service
    if (typeof authService === 'undefined') {
        console.error('Auth service not initialized');
        return;
    }

    // Handle login form submissions
    const generalLoginForm = document.getElementById('general-login');
    const adminLoginForm = document.getElementById('admin-login');

    if (generalLoginForm) {
        generalLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;

            const result = await authService.login(email, password, false);
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                alert(result.error);
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.admin_email.value;
            const password = e.target.admin_password.value;

            const result = await authService.login(email, password, true);
            if (result.success) {
                window.location.href = 'admin-dashboard.html';
            } else {
                alert(result.error);
            }
        });
    }

    // Handle registration form submissions
    const volunteerSignupForm = document.getElementById('volunteer-signup');
    const adminSignupForm = document.getElementById('admin-signup');

    if (volunteerSignupForm) {
        volunteerSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                firstName: e.target.first_name.value,
                lastName: e.target.last_name.value,
                email: e.target.email.value,
                phone: e.target.phone.value,
                password: e.target.password.value,
                skills: Array.from(e.target.skills.selectedOptions).map(option => option.value),
                availability: e.target.availability.value,
                location: e.target.location.value,
                files: e.target.files.files
            };

            const result = await authService.registerUser(formData);
            if (result.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(result.error);
            }
        });
    }

    if (adminSignupForm) {
        adminSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                firstName: e.target.first_name.value,
                lastName: e.target.last_name.value,
                email: e.target.email.value,
                phone: e.target.phone.value,
                password: e.target.password.value,
                organization: e.target.organization.value,
                position: e.target.position.value,
                department: e.target.department.value,
                files: e.target.files.files
            };

            const result = await authService.registerAdmin(formData);
            if (result.success) {
                alert('Registration submitted! Please wait for approval.');
                window.location.href = 'login.html';
            } else {
                alert(result.error);
            }
        });
    }

    // Update navigation based on auth status
    const updateNavigation = () => {
        const user = authService.getCurrentUser();
        const navLinks = document.querySelector('.nav-links');
        
        if (user && navLinks) {
            // Update login link to dashboard
            const loginLinks = navLinks.querySelectorAll('a[href="login.html"]');
            loginLinks.forEach(link => {
                link.textContent = 'Dashboard';
                link.href = user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html';
            });

            // Add logout option if not exists
            if (!navLinks.querySelector('.logout-link')) {
                const logoutLi = document.createElement('li');
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.textContent = 'Logout';
                logoutLink.classList.add('logout-link');
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    authService.logout();
                });
                logoutLi.appendChild(logoutLink);
                navLinks.appendChild(logoutLi);
            }
        }
    };

    // Handle password visibility toggle
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const passwordInput = button.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            button.classList.toggle('fa-eye');
            button.classList.toggle('fa-eye-slash');
        });
    });

    // Initialize navigation
    updateNavigation();
});