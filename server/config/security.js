const db = require('./db');

// Check if security is enabled
const isSecurityEnabled = async () => {
  try {
    const [results] = await db.query('SELECT is_secured FROM security_settings WHERE id = 1');
    return results[0].is_secured;
  } catch (error) {
    console.error('Error checking security status:', error);
    return false; // Default to insecure for demo purposes
  }
};

module.exports = { isSecurityEnabled };