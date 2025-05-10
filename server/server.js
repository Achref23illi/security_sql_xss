const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const commentsRoutes = require('./routes/comments');
const usersRoutes = require('./routes/users');

// Security toggle endpoint
app.get('/api/security-status', async (req, res) => {
  try {
    const db = require('./config/db');
    const [results] = await db.query('SELECT is_secured FROM security_settings WHERE id = 1');
    res.json({ isSecured: results[0].is_secured });
  } catch (error) {
    console.error('Error getting security status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/security-status', async (req, res) => {
  try {
    const { isSecured } = req.body;
    const db = require('./config/db');
    await db.query('UPDATE security_settings SET is_secured = ? WHERE id = 1', [isSecured]);
    res.json({ message: 'Security status updated', isSecured });
  } catch (error) {
    console.error('Error updating security status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);

// Add a diagnostic endpoint
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Enhanced error handler with more details
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access your API at http://localhost:${PORT}`);
});