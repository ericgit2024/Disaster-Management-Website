class AuthService {
    constructor() {
        this.API_BASE = '';
        this.currentUser = null;
        this.checkAuthStatus();
    }

    checkAuthStatus() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            this.currentUser = JSON.parse(userSession);
        }
    }

    async registerUser(userData) {
        try {
            // Validate file types and size before upload
            if (userData.files) {
                const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                for (const file of userData.files) {
                    if (!allowedTypes.includes(file.type)) {
                        throw new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.');
                    }
                    if (file.size > maxSize) {
                        throw new Error('File size exceeds 5MB limit.');
                    }
                }
            }

            const formData = new FormData();
            
            // Add user data
            Object.keys(userData).forEach(key => {
                if (key === 'files') {
                    Array.from(userData.files).forEach(file => {
                        formData.append('files', file);
                    });
                } else {
                    formData.append(key, userData[key]);
                }
            });
            
            // Add role
            formData.append('role', 'volunteer');

            const response = await fetch(`${this.API_BASE}/api/register`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    }

    async registerAdmin(userData) {
        try {
            // Validate file types and size before upload
            if (userData.files) {
                const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                for (const file of userData.files) {
                    if (!allowedTypes.includes(file.type)) {
                        throw new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.');
                    }
                    if (file.size > maxSize) {
                        throw new Error('File size exceeds 5MB limit.');
                    }
                }
            }

            const formData = new FormData();
            
            // Add admin data
            Object.keys(userData).forEach(key => {
                if (key === 'files') {
                    Array.from(userData.files).forEach(file => {
                        formData.append('files', file);
                    });
                } else {
                    formData.append(key, userData[key]);
                }
            });
            
            // Add role
            formData.append('role', 'admin');

            const response = await fetch(`${this.API_BASE}/api/register`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    }

    async login(email, password, isAdmin) {
        try {
            const response = await fetch(`${this.API_BASE}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                    role: isAdmin ? 'admin' : 'volunteer'
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user data in localStorage and update current user
            localStorage.setItem('userSession', JSON.stringify(data.user));
            this.currentUser = data.user;
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('userSession');
        window.location.href = '/login.html';
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    requireAdminAuth() {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
}

// Export a single instance to be used across the application
const authService = new AuthService();