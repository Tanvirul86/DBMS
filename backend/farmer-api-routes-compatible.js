// API Routes compatible with server_old.js
// Add these routes to your server_old.js file

// Add these imports at the top of server_old.js:
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret (add this near the top)
const JWT_SECRET = 'your_secret_key_here'; // Change this to a secure secret

// ========================
// FARMER AUTHENTICATION ROUTES (Add these after your existing farmer CRUD)
// ========================

// Farmer Registration API
app.post('/api/farmer/register', async (req, res) => {
  try {
    const { name, phone, address, farmType, password } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !farmType) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, password and farm type are required'
      });
    }

    // Check if farmer already exists
    db.query(
      'SELECT farmer_id FROM farmer WHERE farmer_phn = ?',
      [phone],
      async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error during registration'
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'User with this phone number already exists'
          });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new farmer
        db.query(
          'INSERT INTO farmer (farmer_name, farmer_phn, farmer_password, farmer_add, farm_type) VALUES (?, ?, ?, ?, ?)',
          [name, phone, passwordHash, address || '', farmType],
          (insertErr, result) => {
            if (insertErr) {
              console.error('Insert error:', insertErr);
              return res.status(500).json({
                success: false,
                message: 'Error saving farmer data'
              });
            }

            res.status(201).json({
              success: true,
              message: 'Farmer registered successfully',
              farmerId: result.insertId
            });
          }
        );
      }
    );

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Farmer Login API
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

    // Find farmer by phone
    db.query(
      'SELECT * FROM farmer WHERE farmer_phn = ?',
      [phone],
      async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error during login'
          });
        }

        if (results.length === 0) {
          return res.status(401).json({
            success: false,
            message: "Don't have account, Register",
            requiresRegistration: true
          });
        }

        const farmer = results[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, farmer.farmer_password);

        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: 'Invalid phone number or password'
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            farmerId: farmer.farmer_id, 
            phone: farmer.farmer_phn, 
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
            id: farmer.farmer_id,
            name: farmer.farmer_name,
            phone: farmer.farmer_phn,
            address: farmer.farmer_add,
            farmType: farmer.farm_type
          }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Check if farmer exists API
app.post('/api/farmer/check', (req, res) => {
  try {
    const { phone } = req.body;

    db.query(
      'SELECT farmer_id FROM farmer WHERE farmer_phn = ?',
      [phone],
      (err, results) => {
        if (err) {
          console.error('Check farmer error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          exists: results.length > 0
        });
      }
    );

  } catch (error) {
    console.error('Check farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/*
Database Setup Instructions for server_old.js:

1. Add password column to your existing farmer table:
   ALTER TABLE farmer ADD COLUMN farmer_password VARCHAR(255) AFTER farmer_phn;

2. Add index for better performance:
   CREATE INDEX idx_farmer_phn ON farmer(farmer_phn);

3. Your farmer table structure should be:
   - farmer_id (existing)
   - farmer_name (existing)
   - farmer_phn (existing)
   - farmer_password (new - for authentication)
   - farmer_add (existing)
   - farm_type (existing)

4. Install bcryptjs and jsonwebtoken:
   npm install bcryptjs jsonwebtoken
*/
