const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'grameen_krishi_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grameen_krishi'
};

let db;

// Initialize database connection
async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Create necessary tables
async function createTables() {
  const tables = [
    // Users table (for both farmers and doctors)
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL,
      user_type ENUM('farmer', 'doctor') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Farmers table
    `CREATE TABLE IF NOT EXISTS farmers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      address TEXT,
      farm_type VARCHAR(50),
      custom_farm_type VARCHAR(100),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const table of tables) {
    try {
      await db.execute(table);
      console.log('Table created/verified successfully');
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }
}

// API Routes

// Farmer Registration
app.post('/api/farmer/register', async (req, res) => {
  try {
    const { name, phone, address, farmType, customFarmType, password } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !farmType) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, password and farm type are required'
      });
    }

    // Check if user already exists
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [userResult] = await db.execute(
      'INSERT INTO users (name, phone, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [name, phone, passwordHash, 'farmer']
    );

    const userId = userResult.insertId;

    // Insert farmer details
    await db.execute(
      'INSERT INTO farmers (user_id, address, farm_type, custom_farm_type) VALUES (?, ?, ?, ?)',
      [userId, address || '', farmType, customFarmType || '']
    );

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      userId: userId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Farmer Login
app.post('/api/farmer/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate required fields
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT u.id, u.name, u.phone, u.password_hash, f.address, f.farm_type, f.custom_farm_type FROM users u LEFT JOIN farmers f ON u.id = f.user_id WHERE u.phone = ? AND u.user_type = ?',
      [phone, 'farmer']
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Don't have account, Register",
        requiresRegistration: true
      });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone, 
        userType: 'farmer' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        farmType: user.farm_type,
        customFarmType: user.custom_farm_type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check if user exists
app.post('/api/farmer/check', async (req, res) => {
  try {
    const { phone } = req.body;

    const [users] = await db.execute(
      'SELECT id FROM users WHERE phone = ? AND user_type = ?',
      [phone, 'farmer']
    );

    res.json({
      exists: users.length > 0
    });

  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
