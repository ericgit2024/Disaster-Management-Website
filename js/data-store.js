class DataStore {
    constructor() {
        this.usersFile = 'users.json';
        this.adminsFile = 'admins.json';
        this.initializeFiles();
    }

    initializeFiles() {
        try {
            // Initialize users file if it doesn't exist
            if (!localStorage.getItem(this.usersFile)) {
                localStorage.setItem(this.usersFile, JSON.stringify([]));
            }
            // Initialize admins file if it doesn't exist
            if (!localStorage.getItem(this.adminsFile)) {
                localStorage.setItem(this.adminsFile, JSON.stringify([]));
            }
        } catch (error) {
            console.error('Error initializing data files:', error);
        }
    }

    saveUsers(users) {
        localStorage.setItem(this.usersFile, JSON.stringify(users));
    }

    saveAdmins(admins) {
        localStorage.setItem(this.adminsFile, JSON.stringify(admins));
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersFile) || '[]');
    }

    getAdmins() {
        return JSON.parse(localStorage.getItem(this.adminsFile) || '[]');
    }

    addUser(userData) {
        const users = this.getUsers();
        if (users.some(user => user.email === userData.email)) {
            throw new Error('Email already registered');
        }
        users.push({
            ...userData,
            id: Date.now(),
            role: 'user',
            createdAt: new Date().toISOString()
        });
        this.saveUsers(users);
        return users[users.length - 1];
    }

    addAdmin(adminData) {
        const admins = this.getAdmins();
        if (admins.some(admin => admin.email === adminData.email)) {
            throw new Error('Email already registered');
        }
        admins.push({
            ...adminData,
            id: Date.now(),
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'pending' // Admins need approval
        });
        this.saveAdmins(admins);
        return admins[admins.length - 1];
    }

    authenticateUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            return { ...user, password: undefined }; // Remove password from returned data
        }
        return null;
    }

    authenticateAdmin(email, password) {
        const admins = this.getAdmins();
        const admin = admins.find(a => a.email === email && a.password === password && a.status === 'approved');
        if (admin) {
            return { ...admin, password: undefined }; // Remove password from returned data
        }
        return null;
    }
}

// Export a single instance to be used across the application
const dataStore = new DataStore();