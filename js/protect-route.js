document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is authenticated
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }

        const { user } = await response.json();
        
        // Check if user has appropriate role for the page
        const isAdminPage = window.location.pathname.includes('admin-');
        if (isAdminPage && user.role !== 'admin') {
            window.location.href = '/login.html';
            return;
        } else if (!isAdminPage && user.role !== 'volunteer') {
            window.location.href = '/login.html';
            return;
        }

        // Update user info on the page if needed
        const userNameElement = document.getElementById('user-name');
        const userEmailElement = document.getElementById('user-email');
        const userRoleElement = document.getElementById('user-role');

        if (userNameElement) {
            userNameElement.textContent = `${user.firstName} ${user.lastName}`;
        }
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
        if (userRoleElement) {
            userRoleElement.textContent = user.role;
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
    }
    if (!window.authService) {
        console.error('Auth service not initialized');
        window.location.href = '/login.html';
        return;
    }

    const currentPath = window.location.pathname;
    
    // Protect admin routes
    if (currentPath.includes('admin-')) {
        if (!authService.requireAdminAuth()) {
            return; // requireAdminAuth will handle the redirect
        }
    }
    // Protect user dashboard
    else if (currentPath.includes('dashboard.html')) {
        if (!authService.requireAuth()) {
            return; // requireAuth will handle the redirect
        }
    }

    // Update user info in the dashboard if available
    const userInfo = authService.getCurrentUser();
    if (userInfo) {
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElements = document.querySelectorAll('.user-email');
        const userRoleElements = document.querySelectorAll('.user-role');

        userNameElements.forEach(element => {
            element.textContent = `${userInfo.firstName} ${userInfo.lastName}`;
        });

        userEmailElements.forEach(element => {
            element.textContent = userInfo.email;
        });

        userRoleElements.forEach(element => {
            element.textContent = userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1);
        });
    }
});