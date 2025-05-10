const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isSecurityEnabled } = require('../config/security');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // With security: Hash password and use parameterized queries
    const securityEnabled = await isSecurityEnabled();
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries and hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        userId: result.insertId
      });
    } else {
      // Insecure version - Direct string concatenation (SQL Injection vulnerability)
      // WARNING: This is intentionally vulnerable for demonstration purposes
      const query = `INSERT INTO users (username, email, password) 
                     VALUES ('${username}', '${email}', '${password}')`;
      
      const [result] = await db.query(query);
      
      res.status(201).json({
        message: 'User registered successfully',
        userId: result.insertId
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Log login attempt for debugging
    console.log('Login attempt:', { username, passwordProvided: !!password });
    
    const securityEnabled = await isSecurityEnabled();
    
    let user;
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [users] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      user = users[0];
      
      // Check if password is valid
      let passwordMatch = false;
      
      // Check if the stored password is already a bcrypt hash
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        // If it's a bcrypt hash, use bcrypt.compare
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // If it's not a hash (demo data), do a direct comparison
        // NOTE: This is only for the demo to work with seed data
        passwordMatch = (password === user.password);
        console.log('Using direct password comparison (demo mode)');
      }
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // Insecure version - SQL Injection vulnerability
      
      // For comment-style injections to work correctly, we need to ensure MySQL properly interprets them
      // First, try to detect if user is attempting a comment-style injection
      let modifiedUsername = username;
      if (username.includes('--')) {
        // Add a space after -- to make it a valid MySQL comment
        modifiedUsername = username.replace(/--/g, '-- ');
      }
      
      // Alternative approach - handle multiple injection styles
      if (username.includes('#')) {
        // MySQL specific comment
        modifiedUsername = username.replace(/#/g, '# ');
      }
      
      const query = `SELECT * FROM users WHERE username = '${modifiedUsername}' AND password = '${password}'`;
      
      console.log('Executing SQL query:', query);
      
      try {
        const [users] = await db.query(query);
        
        console.log('Query returned:', users.length, 'results');
        
        if (users.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        user = users[0];
      } catch (sqlError) {
        console.error('SQL error during insecure login:', sqlError.message);
        console.error('Attempted query:', query);
        
        // Let's try a different approach for classic SQL injection payloads
        if (username.includes('--') || username.includes('#') || username.includes('"') || username.includes("'")) {
          try {
            // Attempt with a simplified approach for SQL injection demos
            const simpleQuery = `SELECT * FROM users WHERE username = '${username}' OR 1=1 LIMIT 1`;
            console.log('Attempting simplified injection query:', simpleQuery);
            
            const [users] = await db.query(simpleQuery);
            if (users.length > 0) {
              user = users[0];
              console.log('Simplified query succeeded, user found');
            } else {
              return res.status(401).json({ message: 'Invalid credentials' });
            }
          } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError.message);
            return res.status(500).json({ 
              message: 'SQL error during login. Try a different injection payload.',
              details: process.env.NODE_ENV === 'development' ? sqlError.message : undefined
            });
          }
        } else {
          return res.status(500).json({ 
            message: 'SQL error during login. Check server logs for details.',
            details: process.env.NODE_ENV === 'development' ? sqlError.message : undefined
          });
        }
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;