// File: server/setup-db.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  console.log('Setting up database...');
  
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };
  
  try {
    // Create a connection to MySQL (without database)
    const connection = await mysql.createConnection(dbConfig);
    
    // Read SQL files
    const databaseSql = fs.readFileSync(path.join(__dirname, '../sql/database.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../sql/seed.sql'), 'utf8');
    
    console.log('Creating database structure...');
    // Split and execute each SQL statement in database.sql
    const databaseStatements = databaseSql.split(';').filter(statement => statement.trim() !== '');
    for (const statement of databaseStatements) {
      await connection.query(statement + ';');
    }
    
    console.log('Seeding database with initial data...');
    // Split and execute each SQL statement in seed.sql
    const seedStatements = seedSql.split(';').filter(statement => statement.trim() !== '');
    for (const statement of seedStatements) {
      await connection.query(statement + ';');
    }
    
    console.log('Database setup completed successfully!');
    
    // Close the connection
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('✅ Database initialization complete');
      } else {
        console.log('❌ Database initialization failed');
      }
      process.exit(success ? 0 : 1);
    });
}

module.exports = setupDatabase;