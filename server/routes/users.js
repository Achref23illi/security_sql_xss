const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isSecurityEnabled } = require('../config/security');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, is_admin, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const securityEnabled = await isSecurityEnabled();
    
    let user;
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [users] = await db.query(
        'SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user = users[0];
    } else {
      // Insecure version - SQL Injection vulnerability
      // WARNING: This is intentionally vulnerable for demonstration
      const query = `SELECT id, username, email, is_admin, created_at FROM users WHERE id = ${id}`;
      
      const [users] = await db.query(query);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user = users[0];
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

module.exports = router;