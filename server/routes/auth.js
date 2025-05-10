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
      
      // Check password (assuming passwords are hashed in the database)
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // Insecure version - SQL Injection vulnerability
      // WARNING: This is intentionally vulnerable for demonstration
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      
      const [users] = await db.query(query);
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      user = users[0];
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
    res.status(500).json({ message: 'Error during login' });
  }
});

module.exports = router;