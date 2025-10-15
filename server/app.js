const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

// VULNERABILITY: Hardcoded secret key
const JWT_SECRET = 'super-secret-key-123';

// VULNERABILITY: Overly permissive CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

// VULNERABILITY: No request size limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// VULNERABILITY: Insecure session configuration
app.use(session({
  secret: 'weak-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Should be true in production with HTTPS
    httpOnly: false, // Should be true to prevent XSS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize SQLite database
const db = new sqlite3.Database('./database.db');

// VULNERABILITY: Database initialization without proper error handling
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT,
    role TEXT DEFAULT 'user',
    name TEXT,
    bio TEXT,
    website TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    session_id TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    original_name TEXT,
    mimetype TEXT,
    size INTEGER,
    path TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default users with weak passwords
  const defaultUsers = [
    { username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', name: 'Administrator' },
    { username: 'user', email: 'user@example.com', password: 'password', role: 'user', name: 'Regular User' },
    { username: 'test', email: 'test@example.com', password: '123456', role: 'user', name: 'Test User' }
  ];

  defaultUsers.forEach(user => {
    // VULNERABILITY: Weak password hashing
    const hashedPassword = bcrypt.hashSync(user.password, 1); // Very weak salt rounds
    db.run(`INSERT OR IGNORE INTO users (username, email, password, role, name) VALUES (?, ?, ?, ?, ?)`,
      [user.username, user.email, hashedPassword, user.role, user.name]);
  });

  // Insert sample comments with XSS payloads
  const sampleComments = [
    { user_id: 1, username: 'admin', content: 'Welcome to our secure platform!' },
    { user_id: 2, username: 'user', content: 'This is a normal comment.' },
    { user_id: 2, username: 'user', content: '<script>alert("XSS vulnerability!")</script>This comment contains malicious code.' },
    { user_id: 3, username: 'test', content: '<img src="x" onerror="alert(\'Another XSS!\')">' }
  ];

  sampleComments.forEach(comment => {
    db.run(`INSERT OR IGNORE INTO comments (user_id, username, content) VALUES (?, ?, ?)`,
      [comment.user_id, comment.username, comment.content]);
  });
});

// VULNERABILITY: File upload configuration without security restrictions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // VULNERABILITY: User-controllable upload path
    const uploadPath = req.body.uploadPath || './uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // VULNERABILITY: No filename sanitization
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  // VULNERABILITY: No file size or type restrictions
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB - too large
    files: 10
  }
});

// VULNERABILITY: Weak authentication middleware
function authenticateToken(req, res, next) {
  const token = req.query.token || req.body.token || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    // VULNERABILITY: No proper token validation
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // VULNERABILITY: Exposing detailed error information
    return res.status(403).json({ success: false, message: 'Invalid token: ' + error.message });
  }
}

// VULNERABILITY: No admin role verification
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // VULNERABILITY: SQL injection - direct string concatenation
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  
  db.get(query, (err, user) => {
    if (err) {
      // VULNERABILITY: Exposing database errors
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // VULNERABILITY: Timing attack - different response times for different scenarios
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // VULNERABILITY: Including sensitive data in JWT payload
        const token = jwt.sign({
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          password: user.password // Never include password in JWT!
        }, JWT_SECRET, { expiresIn: '24h' });

        // VULNERABILITY: Updating last login without parameterized query
        db.run(`UPDATE users SET last_login = '${new Date().toISOString()}' WHERE id = ${user.id}`);

        res.json({
          success: true,
          token: token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: new Date().toISOString(),
            sessionId: Math.random().toString(36) // Weak session ID generation
          }
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
      }
    });
  });
});

// Comments endpoints
app.get('/api/comments', (req, res) => {
  // VULNERABILITY: No pagination, returns all comments
  db.all('SELECT * FROM comments ORDER BY created_at DESC', (err, comments) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json(comments);
  });
});

app.post('/api/comments', (req, res) => {
  const { content, userId } = req.body;

  // VULNERABILITY: No input validation or sanitization
  // VULNERABILITY: SQL injection vulnerability
  const query = `INSERT INTO comments (user_id, username, content) 
                 SELECT ${userId}, username, '${content}' FROM users WHERE id = ${userId}`;

  db.run(query, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, commentId: this.lastID });
  });
});

app.delete('/api/comments/:id', (req, res) => {
  const commentId = req.params.id;
  
  // VULNERABILITY: No authorization check - anyone can delete any comment
  // VULNERABILITY: SQL injection in DELETE statement
  db.run(`DELETE FROM comments WHERE id = ${commentId}`, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'Comment deleted' });
  });
});

// Dashboard endpoint
app.get('/api/dashboard', authenticateToken, (req, res) => {
  // VULNERABILITY: Exposing sensitive system information
  res.json({
    serverInfo: 'Node.js v16.14.0 on Ubuntu 20.04',
    dbConnection: 'SQLite database.db',
    activeSessions: Math.floor(Math.random() * 50) + 10,
    memoryUsage: process.memoryUsage(),
    apiEndpoints: [
      'GET /api/comments',
      'POST /api/login',
      'GET /api/dashboard',
      'POST /api/upload',
      'GET /api/admin/users',
      'DELETE /api/admin/logs'
    ],
    environment: process.env.NODE_ENV || 'development',
    secretKey: JWT_SECRET, // Never expose this!
    databasePath: path.resolve('./database.db')
  });
});

// Action endpoint
app.post('/api/action', authenticateToken, (req, res) => {
  const { action } = req.body;

  // VULNERABILITY: Command injection - executing user input
  exec(`echo "Executing action: ${action}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, message: stdout });
  });
});

// File upload endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const uploadedFiles = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path
  }));

  // VULNERABILITY: No validation of uploaded files
  uploadedFiles.forEach(file => {
    db.run(`INSERT INTO uploads (filename, original_name, mimetype, size, path, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      [file.filename, file.originalname, file.mimetype, file.size, file.path, req.user.id]);
  });

  res.json({ success: true, files: uploadedFiles });
});

// File download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // VULNERABILITY: Path traversal - no validation of filename
  const filePath = path.join('./uploads/', filename);
  
  // VULNERABILITY: Directory traversal attack possible
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  });
});

// File execution endpoint
app.post('/api/execute', authenticateToken, (req, res) => {
  const { filename, executeAsAdmin } = req.body;
  
  // VULNERABILITY: Arbitrary file execution
  const filePath = path.join('./uploads/', filename);
  
  // VULNERABILITY: Command injection and privilege escalation
  const command = executeAsAdmin ? `sudo node ${filePath}` : `node ${filePath}`;
  
  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout || stderr || (error ? error.message : 'No output'),
      command: command // VULNERABILITY: Exposing executed command
    });
  });
});

// Admin endpoints
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  // VULNERABILITY: Returning all user data including passwords
  db.all('SELECT * FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json(users);
  });
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  // VULNERABILITY: No validation, can delete admin users
  db.run(`DELETE FROM users WHERE id = ${userId}`, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'User deleted' });
  });
});

app.put('/api/admin/users/:id/promote', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  // VULNERABILITY: SQL injection in UPDATE statement
  db.run(`UPDATE users SET role = 'admin' WHERE id = ${userId}`, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'User promoted to admin' });
  });
});

app.get('/api/admin/logs', authenticateToken, requireAdmin, (req, res) => {
  // VULNERABILITY: Fake logs with sensitive information
  const fakeLogs = [
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'Server started' },
    { timestamp: new Date().toISOString(), level: 'WARN', message: 'Failed login attempt for admin from 192.168.1.100' },
    { timestamp: new Date().toISOString(), level: 'ERROR', message: 'Database connection failed: password incorrect' },
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'JWT token generated for user: admin' },
    { timestamp: new Date().toISOString(), level: 'DEBUG', message: 'SQL Query: SELECT * FROM users WHERE username = admin' },
    { timestamp: new Date().toISOString(), level: 'WARN', message: 'Suspicious file upload: script.php' }
  ];
  
  res.json(fakeLogs);
});

app.post('/api/admin/sql', authenticateToken, requireAdmin, (req, res) => {
  const { query } = req.body;
  
  // VULNERABILITY: Direct SQL execution without any validation
  db.all(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, result: result });
  });
});

// Profile update endpoint
app.put('/api/profile', authenticateToken, (req, res) => {
  const { name, email, bio, website } = req.body;
  const userId = req.user.id;

  // VULNERABILITY: SQL injection in UPDATE statement
  const query = `UPDATE users SET name = '${name}', email = '${email}', bio = '${bio}', website = '${website}' WHERE id = ${userId}`;
  
  db.run(query, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// VULNERABILITY: Serving static files without authentication
app.use('/uploads', express.static('uploads'));

// VULNERABILITY: Debug endpoint exposing sensitive information
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      memoryUsage: process.memoryUsage()
    },
    databaseInfo: {
      path: path.resolve('./database.db'),
      exists: fs.existsSync('./database.db')
    },
    jwtSecret: JWT_SECRET,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // VULNERABILITY: Exposing detailed error information
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack,
    details: err
  });
});

// VULNERABILITY: No rate limiting
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Vulnerable server running on http://localhost:${PORT}`);
  console.log(`Debug endpoint: http://localhost:${PORT}/api/debug`);
  console.log('WARNING: This server contains intentional security vulnerabilities!');
});

module.exports = app;