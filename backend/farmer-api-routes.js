// Backend API Endpoints for Farmer Registration & Login
// This file contains the API routes that should be added to server_old.js

// Add these imports at the top of server_old.js (uncomment them):
/*
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
*/

// Add these API routes to server_old.js:

// 1. Farmer Registration API
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
      message: 'Internal server error during registration'
    });
  }
});

// 2. Farmer Login API
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

    // Find user with farmer details
    const [users] = await db.execute(
      `SELECT u.id, u.name, u.phone, u.password_hash, 
              f.address, f.farm_type, f.custom_farm_type 
       FROM users u 
       LEFT JOIN farmers f ON u.id = f.user_id 
       WHERE u.phone = ? AND u.user_type = ?`,
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
      message: 'Internal server error during login'
    });
  }
});

// 3. Check if farmer exists API (optional)
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

// 4. Update farmer profile API
app.put('/api/farmer/profile', async (req, res) => {
  try {
    const { phone, name, address, farmType, customFarmType } = req.body;
    
    // Validate authorization token (optional)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.phone !== phone) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized to update this profile'
          });
        }
      } catch (tokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
    }

    // Update user name
    await db.execute(
      'UPDATE users SET name = ? WHERE phone = ? AND user_type = ?',
      [name, phone, 'farmer']
    );

    // Update farmer details
    await db.execute(
      `UPDATE farmers f 
       JOIN users u ON f.user_id = u.id 
       SET f.address = ?, f.farm_type = ?, f.custom_farm_type = ? 
       WHERE u.phone = ? AND u.user_type = ?`,
      [address, farmType, customFarmType, phone, 'farmer']
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during profile update'
    });
  }
});

/*
Database Schema Required:

-- Users table (for both farmers and doctors)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  user_type ENUM('farmer', 'doctor') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  address TEXT,
  farm_type VARCHAR(50),
  custom_farm_type VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_farmers_user_id ON farmers(user_id);
*/
