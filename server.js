const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

// Constants
const SALT_ROUNDS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Create required directories if they don't exist
const directories = ['adminjson', 'volunteerjson', 'adminfiles', 'volunteerfiles'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});

// File filter for multer
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'));
    }
    cb(null, true);
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const role = req.body.role || 'volunteer';
        const uploadDir = role === 'admin' ? 'adminfiles' : 'volunteerfiles';
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Authentication Routes
app.get('/api/check-auth', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.session.user });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

app.post('/api/register', upload.array('files'), async (req, res) => {
    const { email, password, role, ...userData } = req.body;
    const userDir = role === 'admin' ? 'adminjson' : 'volunteerjson';
    const fileName = `${email.replace('@', '_at_')}.json`;
    const filePath = path.join(userDir, fileName);

    // Check if user already exists
    if (fs.existsSync(filePath)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // Create user data object
        const userObject = {
            ...userData,
            email,
            password: hashedPassword,
            role,
            files: req.files ? req.files.map(f => f.filename) : [],
            registeredAt: new Date().toISOString()
        };

        try {
            fs.writeFileSync(filePath, JSON.stringify(userObject, null, 2));
            res.json({ message: 'Registration successful' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    } catch (error) {
        console.error('Password hashing error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    const userDir = role === 'admin' ? 'adminjson' : 'volunteerjson';
    const fileName = `${email.replace('@', '_at_')}.json`;
    const filePath = path.join(userDir, fileName);

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const isValidPassword = await bcrypt.compare(password, userData.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set user session
        req.session.user = {
            id: email,
            role: userData.role,
            email: userData.email
        };

        // Remove sensitive data before sending response
        const { password: _, ...safeUserData } = userData;
        res.json({
            message: 'Login successful',
            user: safeUserData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// API Routes
app.get('/api/alerts', (req, res) => {
    // Placeholder for alerts API
    res.json([]);
});

app.get('/api/volunteers', (req, res) => {
    // Placeholder for volunteers API
    res.json([]);
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});