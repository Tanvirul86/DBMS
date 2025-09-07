const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'grameen_krishi_secret_key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Doctor Dashboard API Routes

// Doctor registration endpoint
app.post('/api/doctor/register', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      password, 
      qualification, 
      specialization, 
      experienceYears, 
      workplace, 
      licenseNumber,
      availableTimeStart,
      availableTimeEnd,
      availableDays,
      consultationFee
    } = req.body;

    // Check if user already exists
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE phone = ? OR email = ?',
      [phone, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this phone or email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [userResult] = await db.execute(
      'INSERT INTO users (name, phone, email, password_hash, user_type) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email, hashedPassword, 'doctor']
    );

    const userId = userResult.insertId;

    // Create doctor profile
    await db.execute(
      `INSERT INTO doctors 
       (user_id, qualification, specialization, experience_years, workplace, license_number, 
        available_time_start, available_time_end, available_days, consultation_fee) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        qualification, 
        specialization, 
        experienceYears, 
        workplace, 
        licenseNumber,
        availableTimeStart,
        availableTimeEnd,
        typeof availableDays === 'string' ? availableDays : JSON.stringify(availableDays || []),
        consultationFee
      ]
    );

    res.status(201).json({ 
      message: 'Doctor registration successful', 
      userId: userId 
    });

  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});


// Doctor login endpoint
app.post('/api/doctor/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT u.*, d.* FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.email = ? AND u.user_type = "doctor"',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: 'doctor', doctorId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      doctor: {
        id: user.user_id,
        doctorId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        qualification: user.qualification,
        specialization: user.specialization,
        experienceYears: user.experience_years,
        workplace: user.workplace,
        consultationFee: user.consultation_fee,
        rating: user.rating,
        totalConsultations: user.total_consultations,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get doctor's assigned appointments
app.get('/api/doctor/appointments', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, date, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.*,
        u.name as farmer_name,
        u.phone as farmer_phone,
        f.address as farmer_address,
        f.farm_type,
        f.farm_size,
        f.experience_years as farmer_experience
      FROM appointments a
      JOIN farmers f ON a.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE a.doctor_id = ?
    `;

    const params = [req.user.doctorId];

    // Add filters
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [appointments] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?';
    const countParams = [req.user.doctorId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (date) {
      countQuery += ' AND appointment_date = ?';
      countParams.push(date);
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      appointments,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status
app.patch('/api/doctor/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if appointment belongs to this doctor
    const [appointment] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointmentId, req.user.doctorId]
    );

    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update status
    await db.execute(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, appointmentId]
    );

    // Update doctor's consultation count if completed
    if (status === 'completed') {
      await db.execute(
        'UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?',
        [req.user.doctorId]
      );
    }

    res.json({ 
      message: 'Appointment status updated successfully',
      appointmentId,
      status 
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// Add consultation notes and prescription
app.patch('/api/doctor/appointments/:id/notes', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentId = req.params.id;
    const { consultationNotes, prescription } = req.body;

    // Check if appointment belongs to this doctor
    const [appointment] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointmentId, req.user.doctorId]
    );

    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Prepare notes object
    const notesData = {
      consultation_notes: consultationNotes,
      prescription: prescription,
      updated_at: new Date().toISOString(),
      doctor_id: req.user.doctorId
    };

    // Update consultation notes
    await db.execute(
      'UPDATE appointments SET consultation_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(notesData), appointmentId]
    );

    res.json({ 
      message: 'Consultation notes updated successfully',
      appointmentId 
    });

  } catch (error) {
    console.error('Error updating consultation notes:', error);
    res.status(500).json({ error: 'Failed to update consultation notes' });
  }
});

// Get doctor dashboard statistics
app.get('/api/doctor/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doctorId = req.user.doctorId;

    // Get various statistics
    const [totalAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?',
      [doctorId]
    );

    const [pendingAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "pending"',
      [doctorId]
    );

    const [completedAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "completed"',
      [doctorId]
    );

    const [todayAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()',
      [doctorId]
    );

    const [totalEarnings] = await db.execute(
      'SELECT SUM(fee) as total FROM appointments WHERE doctor_id = ? AND status = "completed"',
      [doctorId]
    );

    const [recentAppointments] = await db.execute(
      `SELECT a.*, u.name as farmer_name, u.phone as farmer_phone 
       FROM appointments a 
       JOIN farmers f ON a.farmer_id = f.id 
       JOIN users u ON f.user_id = u.id 
       WHERE a.doctor_id = ? 
       ORDER BY a.created_at DESC 
       LIMIT 5`,
      [doctorId]
    );

    res.json({
      statistics: {
        totalAppointments: totalAppointments[0].count,
        pendingAppointments: pendingAppointments[0].count,
        completedAppointments: completedAppointments[0].count,
        todayAppointments: todayAppointments[0].count,
        totalEarnings: totalEarnings[0].total || 0
      },
      recentAppointments
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get single appointment details
app.get('/api/doctor/appointments/:id', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentId = req.params.id;

    const [appointments] = await db.execute(
      `SELECT 
        a.*,
        u.name as farmer_name,
        u.phone as farmer_phone,
        u.email as farmer_email,
        f.address as farmer_address,
        f.farm_type,
        f.farm_size,
        f.experience_years as farmer_experience
       FROM appointments a
       JOIN farmers f ON a.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE a.id = ? AND a.doctor_id = ?`,
      [appointmentId, req.user.doctorId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Parse consultation notes if they exist
    if (appointment.consultation_notes) {
      try {
        appointment.consultation_notes = JSON.parse(appointment.consultation_notes);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    res.json(appointment);

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ error: 'Failed to fetch appointment details' });
  }
});

// Socket.io for real-time communicationrs());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grameen_krishi'
};

let db;

// Seed medicine shops data
const seedMedicineShops = async () => {
  try {
    const [existing] = await db.execute('SELECT COUNT(*) as count FROM medicine_shops');
    if (existing[0].count > 0) {
      console.log('Medicine shops already seeded');
      return;
    }

    const shops = [
      {
        name: 'Green Life Pharmacy',
        address: 'Dhanmondi 27, Dhaka-1205',
        phone: '01711223344',
        opening_hours: '8:00 AM - 10:00 PM'
      },
      {
        name: 'Farmer Friend Medicine Center',
        address: 'Uttara Sector-7, Dhaka-1230',
        phone: '01722334455',
        opening_hours: '7:00 AM - 11:00 PM'
      },
      {
        name: 'Krishi Care Pharmacy',
        address: 'Mirpur-10, Dhaka-1216',
        phone: '01733445566',
        opening_hours: '9:00 AM - 9:00 PM'
      },
      {
        name: 'Agro Medicine Hub',
        address: 'Gulshan-2, Dhaka-1212',
        phone: '01744556677',
        opening_hours: '8:30 AM - 10:30 PM'
      },
      {
        name: 'Rural Health Pharmacy',
        address: 'Savar, Dhaka-1340',
        phone: '01755667788',
        opening_hours: '7:30 AM - 9:30 PM'
      }
    ];

    for (const shop of shops) {
      await db.execute(
        'INSERT INTO medicine_shops (name, address, phone, opening_hours) VALUES (?, ?, ?, ?)',
        [shop.name, shop.address, shop.phone, shop.opening_hours]
      );
    }

    console.log('✅ Medicine shops seeded successfully');
  } catch (error) {
    console.error('Error seeding medicine shops:', error);
  }
};

// Seed medicines data
const seedMedicines = async () => {
  try {
    const [existing] = await db.execute('SELECT COUNT(*) as count FROM medicines');
    if (existing[0].count > 0) {
      console.log('Medicines already seeded');
      return;
    }

    const medicines = [
      {
        name: 'Mancozeb 75% WP',
        generic_name: 'Mancozeb',
        category: 'fungicide',
        dosage_form: 'powder',
        strength: '75%',
        unit: 'gram',
        usage_instructions: '2-3 গ্রাম প্রতি লিটার পানিতে মিশিয়ে স্প্রে করুন',
        side_effects: 'চোখ ও ত্বকে জ্বালাপোড়া হতে পারে',
        precautions: 'হাত মোজা পরে ব্যবহার করুন',
        price_per_unit: 25.00,
        manufacturer: 'ACI Limited'
      },
      {
        name: 'Carbendazim 50% WP',
        generic_name: 'Carbendazim',
        category: 'fungicide',
        dosage_form: 'powder',
        strength: '50%',
        unit: 'gram',
        usage_instructions: '1-2 গ্রাম প্রতি লিটার পানিতে',
        side_effects: 'শ্বাসযন্ত্রে সমস্যা হতে পারে',
        precautions: 'মাস্ক ব্যবহার করুন',
        price_per_unit: 30.00,
        manufacturer: 'Square Pharmaceuticals'
      },
      {
        name: 'Imidacloprid 17.8% SL',
        generic_name: 'Imidacloprid',
        category: 'insecticide',
        dosage_form: 'liquid',
        strength: '17.8%',
        unit: 'ml',
        usage_instructions: '0.5 মিলি প্রতি লিটার পানিতে',
        side_effects: 'চোখে জ্বালাপোড়া',
        precautions: 'চোখের সংস্পর্শ এড়িয়ে চলুন',
        price_per_unit: 45.00,
        manufacturer: 'Bayer CropScience'
      },
      {
        name: 'Urea Fertilizer',
        generic_name: 'Urea',
        category: 'fertilizer',
        dosage_form: 'granules',
        strength: '46% N',
        unit: 'kg',
        usage_instructions: '২০-৩০ গ্রাম প্রতি গাছে',
        side_effects: 'অতিরিক্ত ব্যবহারে পাতা পুড়ে যেতে পারে',
        precautions: 'সকালে বা বিকেলে প্রয়োগ করুন',
        price_per_unit: 22.00,
        manufacturer: 'Kafco Bangladesh'
      },
      {
        name: 'TSP Fertilizer',
        generic_name: 'Triple Super Phosphate',
        category: 'fertilizer',
        dosage_form: 'granules',
        strength: '46% P2O5',
        unit: 'kg',
        usage_instructions: '১৫-২০ গ্রাম প্রতি গাছে',
        side_effects: 'কোন পার্শ্বপ্রতিক্রিয়া নেই',
        precautions: 'শুকনো অবস্থায় প্রয়োগ করুন',
        price_per_unit: 28.00,
        manufacturer: 'BCIC'
      },
      {
        name: 'Cypermethrin 10% EC',
        generic_name: 'Cypermethrin',
        category: 'insecticide',
        dosage_form: 'liquid',
        strength: '10%',
        unit: 'ml',
        usage_instructions: '1 মিলি প্রতি লিটার পানিতে',
        side_effects: 'ত্বকে অ্যালার্জি হতে পারে',
        precautions: 'গ্লাভস ব্যবহার করুন',
        price_per_unit: 35.00,
        manufacturer: 'Syngenta Bangladesh'
      },
      {
        name: 'Glyphosate 41% SL',
        generic_name: 'Glyphosate',
        category: 'herbicide',
        dosage_form: 'liquid',
        strength: '41%',
        unit: 'ml',
        usage_instructions: '২-৩ মিলি প্রতি লিটার পানিতে',
        side_effects: 'চোখ ও ত্বকে জ্বালাপোড়া',
        precautions: 'সুরক্ষা পোশাক পরুন',
        price_per_unit: 40.00,
        manufacturer: 'Monsanto'
      },
      {
        name: 'MOP Fertilizer',
        generic_name: 'Muriate of Potash',
        category: 'fertilizer',
        dosage_form: 'granules',
        strength: '60% K2O',
        unit: 'kg',
        usage_instructions: '১০-১৫ গ্রাম প্রতি গাছে',
        side_effects: 'কোন পার্শ্বপ্রতিক্রিয়া নেই',
        precautions: 'ভেজা মাটিতে প্রয়োগ করুন',
        price_per_unit: 24.00,
        manufacturer: 'BCIC'
      },
      {
        name: 'Chlorpyrifos 20% EC',
        generic_name: 'Chlorpyrifos',
        category: 'insecticide',
        dosage_form: 'liquid',
        strength: '20%',
        unit: 'ml',
        usage_instructions: '2 মিলি প্রতি লিটার পানিতে',
        side_effects: 'মাথাব্যথা হতে পারে',
        precautions: 'বাতাসের বিপরীত দিকে স্প্রে করুন',
        price_per_unit: 50.00,
        manufacturer: 'Dow Chemical'
      },
      {
        name: 'Zinc Sulphate',
        generic_name: 'Zinc Sulphate',
        category: 'fertilizer',
        dosage_form: 'powder',
        strength: '33% Zn',
        unit: 'gram',
        usage_instructions: '5-10 গ্রাম প্রতি গাছে',
        side_effects: 'কোন পার্শ্বপ্রতিক্রিয়া নেই',
        precautions: 'পানিতে গুলিয়ে ব্যবহার করুন',
        price_per_unit: 18.00,
        manufacturer: 'ACI Agribusiness'
      }
    ];

    for (const medicine of medicines) {
      await db.execute(
        `INSERT INTO medicines (name, generic_name, category, dosage_form, strength, unit, usage_instructions, side_effects, precautions, price_per_unit, manufacturer) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [medicine.name, medicine.generic_name, medicine.category, medicine.dosage_form, medicine.strength, medicine.unit, 
         medicine.usage_instructions, medicine.side_effects, medicine.precautions, medicine.price_per_unit, medicine.manufacturer]
      );
    }

    console.log('✅ Medicines seeded successfully');
  } catch (error) {
    console.error('Error seeding medicines:', error);
  }
};

// Seed vaccines data
const seedVaccines = async () => {
  try {
    const [existing] = await db.execute('SELECT COUNT(*) as count FROM vaccines');
    if (existing[0].count > 0) {
      console.log('Vaccines already seeded');
      return;
    }

    const vaccines = [
      {
        name: 'Newcastle Disease Vaccine',
        disease_target: 'Newcastle Disease',
        animal_type: 'poultry',
        vaccine_type: 'live',
        dosage: '0.03ml per bird',
        administration_route: 'injection',
        storage_temp: '2-8°C',
        shelf_life: '24 months',
        usage_instructions: 'সাবকিউটেনিয়াস ইনজেকশন দিন',
        precautions: 'ভ্যাকসিন ঠান্ডা রাখুন',
        price_per_dose: 12.00,
        manufacturer: 'Square Pharmaceuticals'
      },
      {
        name: 'Foot and Mouth Disease Vaccine',
        disease_target: 'Foot and Mouth Disease',
        animal_type: 'livestock',
        vaccine_type: 'killed',
        dosage: '2ml per animal',
        administration_route: 'injection',
        storage_temp: '2-8°C',
        shelf_life: '18 months',
        usage_instructions: 'ইন্ট্রামাসকুলার ইনজেকশন',
        precautions: 'স্টেরাইল সিরিঞ্জ ব্যবহার করুন',
        price_per_dose: 45.00,
        manufacturer: 'Livestock Research Institute'
      },
      {
        name: 'Infectious Bursal Disease Vaccine',
        disease_target: 'Infectious Bursal Disease',
        animal_type: 'poultry',
        vaccine_type: 'live',
        dosage: '0.5ml per bird',
        administration_route: 'drinking_water',
        storage_temp: '2-8°C',
        shelf_life: '12 months',
        usage_instructions: 'পানির সাথে মিশিয়ে খাওয়ান',
        precautions: 'ক্লোরিন মুক্ত পানি ব্যবহার করুন',
        price_per_dose: 8.00,
        manufacturer: 'ACI Animal Health'
      },
      {
        name: 'Anthrax Vaccine',
        disease_target: 'Anthrax',
        animal_type: 'livestock',
        vaccine_type: 'killed',
        dosage: '1ml per animal',
        administration_route: 'injection',
        storage_temp: '2-8°C',
        shelf_life: '24 months',
        usage_instructions: 'সাবকিউটেনিয়াস ইনজেকশন',
        precautions: 'বিশুদ্ধ পরিবেশে প্রয়োগ করুন',
        price_per_dose: 35.00,
        manufacturer: 'Government Vaccine Lab'
      },
      {
        name: 'Fish Vibriosis Vaccine',
        disease_target: 'Vibriosis',
        animal_type: 'fish',
        vaccine_type: 'killed',
        dosage: '0.1ml per 100g fish',
        administration_route: 'injection',
        storage_temp: '2-8°C',
        shelf_life: '18 months',
        usage_instructions: 'ইন্ট্রাপেরিটোনিয়াল ইনজেকশন',
        precautions: 'মাছকে অজ্ঞান করে নিন',
        price_per_dose: 25.00,
        manufacturer: 'Aqua Health Ltd'
      }
    ];

    for (const vaccine of vaccines) {
      await db.execute(
        `INSERT INTO vaccines (name, disease_target, animal_type, vaccine_type, dosage, administration_route, storage_temp, shelf_life, usage_instructions, precautions, price_per_dose, manufacturer) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vaccine.name, vaccine.disease_target, vaccine.animal_type, vaccine.vaccine_type, vaccine.dosage, vaccine.administration_route, 
         vaccine.storage_temp, vaccine.shelf_life, vaccine.usage_instructions, vaccine.precautions, vaccine.price_per_dose, vaccine.manufacturer]
      );
    }

    console.log('✅ Vaccines seeded successfully');
  } catch (error) {
    console.error('Error seeding vaccines:', error);
  }
};

// Initialize database connection
async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    
    // Create tables if they don't exist
    await createTables();
    
    // Seed initial data
    await seedMedicineShops();
    await seedMedicines();
    await seedVaccines();
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
      farmer_name VARCHAR(255),
      address TEXT,
      farm_type VARCHAR(50),
      custom_farm_type VARCHAR(100),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // Doctors table
    `CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      qualification VARCHAR(500) NOT NULL,
      specialization ENUM('crop_diseases', 'pest_management', 'soil_fertility', 'plant_nutrition', 'livestock_health', 'organic_farming') NOT NULL,
      experience_years INT NOT NULL,
      workplace VARCHAR(255),
      license_number VARCHAR(100),
      available_time_start TIME,
      available_time_end TIME,
      available_days JSON,
      consultation_fee DECIMAL(10,2),
      rating DECIMAL(3,2) DEFAULT 5.00,
      total_consultations INT DEFAULT 0,
      document_path VARCHAR(500),
      is_verified BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // Appointments table
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id INT NOT NULL,
      doctor_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
  problem_description TEXT NOT NULL,
  google_meet_link VARCHAR(500),
  fee DECIMAL(10,2) DEFAULT 0.00,
      farm_type ENUM('rice', 'vegetables', 'fruits', 'livestock', 'poultry', 'fish') NOT NULL,
      urgency ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
      status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
      consultation_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )`,
    

    // Prescriptions table
    `CREATE TABLE IF NOT EXISTS prescriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      prescription_no VARCHAR(100) UNIQUE,
      appointment_id INT,
      doctor_id INT,
      farmer_id INT,
      diagnosis TEXT,
      treatment TEXT,
      medicines JSON,
      instructions TEXT,
      follow_up_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL
    )`,

    // Medicine orders table
    `CREATE TABLE IF NOT EXISTS medicine_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      farmer_id INT NOT NULL,
      shop_id INT,
      items JSON,
      total_amount DECIMAL(10,2) DEFAULT 0.00,
      status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_type ENUM('farmer','doctor'),
      user_id INT NOT NULL,
      title VARCHAR(255),
      message TEXT,
      type VARCHAR(100),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Medicine shops table
    `CREATE TABLE IF NOT EXISTS medicine_shops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      phone VARCHAR(50),
      opening_hours VARCHAR(255)
    )`,



    // Medicines table
    `CREATE TABLE IF NOT EXISTS medicines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      generic_name VARCHAR(255),
      category ENUM('pesticide', 'fertilizer', 'growth_regulator', 'herbicide', 'fungicide', 'insecticide') NOT NULL,
      dosage_form ENUM('powder', 'liquid', 'granules', 'tablet', 'spray') NOT NULL,
      strength VARCHAR(100),
      unit VARCHAR(50),
      usage_instructions TEXT,
      side_effects TEXT,
      precautions TEXT,
      price_per_unit DECIMAL(10,2),
      manufacturer VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Vaccines table  
    `CREATE TABLE IF NOT EXISTS vaccines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      disease_target VARCHAR(255) NOT NULL,
      animal_type ENUM('poultry', 'livestock', 'fish', 'general') NOT NULL,
      vaccine_type ENUM('live', 'killed', 'synthetic') NOT NULL,
      dosage VARCHAR(100),
      administration_route ENUM('injection', 'oral', 'spray', 'drinking_water') NOT NULL,
      storage_temp VARCHAR(50),
      shelf_life VARCHAR(100),
      usage_instructions TEXT,
      precautions TEXT,
      price_per_dose DECIMAL(10,2),
      manufacturer VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  console.log('Database tables created successfully');

  // Handle schema updates for existing databases
  await updateDatabaseSchema();
}

// Handle database schema updates
async function updateDatabaseSchema() {
  try {
    // Check if farmer_name column exists in farmers table
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'grameen_krishi' 
      AND TABLE_NAME = 'farmers' 
      AND COLUMN_NAME = 'farmer_name'
    `);

    if (columns.length === 0) {
      // Add farmer_name column if it doesn't exist
      await db.execute(`
        ALTER TABLE farmers 
        ADD COLUMN farmer_name VARCHAR(255) NULL 
        AFTER user_id
      `);
      console.log('✅ Added farmer_name column to farmers table');

      // Update existing farmers with names from users table
      await db.execute(`
        UPDATE farmers f
        JOIN users u ON f.user_id = u.id
        SET f.farmer_name = u.name
        WHERE f.farmer_name IS NULL
      `);
      console.log('✅ Updated existing farmers with names from users table');
    }

    // Check if type column exists in notifications table
    const [notificationCols] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'grameen_krishi' 
      AND TABLE_NAME = 'notifications' 
      AND COLUMN_NAME = 'type'
    `);

    if (notificationCols.length === 0) {
      // Add type column to notifications table
      await db.execute(`
        ALTER TABLE notifications 
        ADD COLUMN type VARCHAR(100) NULL 
        AFTER message
      `);
      console.log('✅ Added type column to notifications table');
    }

  } catch (error) {
    console.error('Error updating database schema:', error);
  }
}

// Doctor Dashboard API Routes

// Doctor login endpoint
app.post('/api/doctor/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT u.*, d.* FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.email = ? AND u.user_type = "doctor"',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, userType: 'doctor', doctorId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      doctor: {
        id: user.user_id,
        doctorId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        qualification: user.qualification,
        specialization: user.specialization,
        experienceYears: user.experience_years,
        workplace: user.workplace,
        consultationFee: user.consultation_fee,
        rating: user.rating,
        totalConsultations: user.total_consultations,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get doctor's assigned appointments
app.get('/api/doctor/appointments', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, date, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.*,
        u.name as farmer_name,
        u.phone as farmer_phone,
        f.address as farmer_address,
        f.farm_type,
        f.farm_size,
        f.experience_years as farmer_experience
      FROM appointments a
      JOIN farmers f ON a.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE a.doctor_id = ?
    `;

    const params = [req.user.doctorId];

    // Add filters
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [appointments] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?';
    const countParams = [req.user.doctorId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (date) {
      countQuery += ' AND appointment_date = ?';
      countParams.push(date);
    }

    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      appointments,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status
app.patch('/api/doctor/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if appointment belongs to this doctor
    const [appointment] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointmentId, req.user.doctorId]
    );

    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update status
    await db.execute(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, appointmentId]
    );

    // Update doctor's consultation count if completed
    if (status === 'completed') {
      await db.execute(
        'UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?',
        [req.user.doctorId]
      );
    }

    res.json({ 
      message: 'Appointment status updated successfully',
      appointmentId,
      status 
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// Add consultation notes and prescription
app.patch('/api/doctor/appointments/:id/notes', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentId = req.params.id;
    const { consultationNotes, prescription } = req.body;

    // Check if appointment belongs to this doctor
    const [appointment] = await db.execute(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointmentId, req.user.doctorId]
    );

    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Prepare notes object
    const notesData = {
      consultation_notes: consultationNotes,
      prescription: prescription,
      updated_at: new Date().toISOString(),
      doctor_id: req.user.doctorId
    };

    // Update consultation notes
    await db.execute(
      'UPDATE appointments SET consultation_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(notesData), appointmentId]
    );

    res.json({ 
      message: 'Consultation notes updated successfully',
      appointmentId 
    });

  } catch (error) {
    console.error('Error updating consultation notes:', error);
    res.status(500).json({ error: 'Failed to update consultation notes' });
  }
});

// Get doctor dashboard statistics
app.get('/api/doctor/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doctorId = req.user.doctorId;

    // Get various statistics
    const [totalAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?',
      [doctorId]
    );

    const [pendingAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "pending"',
      [doctorId]
    );

    const [completedAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "completed"',
      [doctorId]
    );

    const [todayAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()',
      [doctorId]
    );

    const [totalEarnings] = await db.execute(
      'SELECT SUM(fee) as total FROM appointments WHERE doctor_id = ? AND status = "completed"',
      [doctorId]
    );

    const [recentAppointments] = await db.execute(
      `SELECT a.*, u.name as farmer_name, u.phone as farmer_phone 
       FROM appointments a 
       JOIN farmers f ON a.farmer_id = f.id 
       JOIN users u ON f.user_id = u.id 
       WHERE a.doctor_id = ? 
       ORDER BY a.created_at DESC 
       LIMIT 5`,
      [doctorId]
    );

    res.json({
      statistics: {
        totalAppointments: totalAppointments[0].count,
        pendingAppointments: pendingAppointments[0].count,
        completedAppointments: completedAppointments[0].count,
        todayAppointments: todayAppointments[0].count,
        totalEarnings: totalEarnings[0].total || 0
      },
      recentAppointments
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get single appointment details
app.get('/api/doctor/appointments/:id', authenticateToken, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointmentId = req.params.id;

    const [appointments] = await db.execute(
      `SELECT 
        a.*,
        u.name as farmer_name,
        u.phone as farmer_phone,
        u.email as farmer_email,
        f.address as farmer_address,
        f.farm_type,
        f.farm_size,
        f.experience_years as farmer_experience
       FROM appointments a
       JOIN farmers f ON a.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE a.id = ? AND a.doctor_id = ?`,
      [appointmentId, req.user.doctorId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Parse consultation notes if they exist
    if (appointment.consultation_notes) {
      try {
        appointment.consultation_notes = JSON.parse(appointment.consultation_notes);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    res.json(appointment);

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ error: 'Failed to fetch appointment details' });
  }
});

// Routes

// Auth Routes
app.post('/api/auth/register', upload.single('document'), async (req, res) => {

})

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
    
    // Insert specific user type data
    if (userType === 'farmer') {
      await db.execute(
        'INSERT INTO farmers (user_id, farmer_name, address, farm_type, farm_size, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, otherData.address, otherData.farmType, otherData.farmSize || 0, otherData.experienceYears || 0]
      );
    } else if (userType === 'doctor') {
      const documentPath = req.file ? req.file.path : null;
      const availableDays = JSON.parse(otherData.availableDays || '[]');
      
      await db.execute(
        'INSERT INTO doctors (user_id, qualification, specialization, experience_years, workplace, license_number, available_time_start, available_time_end, available_days, consultation_fee, document_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, otherData.qualification, otherData.specialization, otherData.experienceYears, otherData.workplace, otherData.licenseNumber, otherData.availableTimeStart, otherData.availableTimeEnd, JSON.stringify(availableDays), otherData.consultationFee, documentPath]
      );
    }
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: userId 
    });
  console.log(`User registered: id=${userId}, phone=${phone}, type=${userType}`);

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

// Generic Auth Login (handles both farmer and doctor)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password, userType } = req.body;

    if (!phone || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Phone, password, and userType are required'
      });
    }

    let userQuery = '';
    let userParams = [];
    let userRole = '';
    let userFields = {};

    if (userType === 'farmer') {
      userQuery = 'SELECT u.id, u.name, u.phone, u.password_hash, f.address, f.farm_type, f.custom_farm_type FROM users u LEFT JOIN farmers f ON u.id = f.user_id WHERE u.phone = ? AND u.user_type = ?';
      userParams = [phone, 'farmer'];
      userRole = 'farmer';
    } else if (userType === 'doctor') {
      userQuery = 'SELECT u.id, u.name, u.phone, u.password_hash, d.specialization, d.license_number, d.is_verified FROM users u LEFT JOIN doctors d ON u.id = d.user_id WHERE u.phone = ? AND u.user_type = ?';
      userParams = [phone, 'doctor'];
      userRole = 'doctor';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid userType'
      });
    }

    const [users] = await db.execute(userQuery, userParams);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Don't have account, Register",
        requiresRegistration: true
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        userType: userRole
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user fields for response
    if (userRole === 'farmer') {
      userFields = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        farmType: user.farm_type,
        customFarmType: user.custom_farm_type
      };
    } else if (userRole === 'doctor') {
      userFields = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        specialization: user.specialization,
        licenseNumber: user.license_number,
        isVerified: user.is_verified
      };
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: userFields
    });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Doctor Routes
app.get('/api/doctors', async (req, res) => {
  try {
    const [doctors] = await db.execute(`
      SELECT 
        d.*, 
        u.name, 
        u.phone, 
        u.email 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.is_verified = TRUE
      ORDER BY d.rating DESC
    `);
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get appointments for the authenticated doctor
app.get('/api/appointments/doctor', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') return res.status(403).json({ error: 'Not a doctor' });

    // find doctor id
    const [docRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.userId]);
    if (docRows.length === 0) return res.json([]);
    const doctorId = docRows[0].id;

    const [appointments] = await db.execute('SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_date DESC, appointment_time DESC', [doctorId]);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create standalone prescription (doctor to any farmer) - MUST BE BEFORE generic /api/prescriptions
app.post('/api/prescriptions/standalone', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Only doctors can create prescriptions.' });
    }

    const doctorUserId = req.user.userId;
    const { 
      farmerId, 
      diagnosis, 
      treatment, 
      medicines, 
      vaccines,
      instructions, 
      followUpDate,
      notes 
    } = req.body;

    // Get doctor ID from user ID
    const [doctorRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [doctorUserId]);
    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    const doctorId = doctorRows[0].id;

    // Validate farmer exists
    const [farmerRows] = await db.execute('SELECT user_id FROM farmers WHERE id = ?', [farmerId]);
    if (farmerRows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Generate unique prescription number
    const prescriptionNo = 'RX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Combine medicines and vaccines
    const allMedicines = [
      ...(medicines || []).map(m => ({...m, type: 'medicine'})),
      ...(vaccines || []).map(v => ({...v, type: 'vaccine'}))
    ];

    // Insert prescription
    const [result] = await db.execute(`
      INSERT INTO prescriptions 
      (prescription_no, doctor_id, farmer_id, diagnosis, treatment, medicines, instructions, follow_up_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      prescriptionNo,
      doctorId,
      farmerId,
      diagnosis,
      treatment,
      JSON.stringify(allMedicines),
      instructions,
      followUpDate || null
    ]);

    // Send notification to farmer (don't fail prescription creation if notification fails)
    const farmerUserId = farmerRows[0].user_id;
    const [doctorInfo] = await db.execute('SELECT u.name FROM users u JOIN doctors d ON u.id = d.user_id WHERE d.id = ?', [doctorId]);
    const doctorName = doctorInfo[0]?.name || 'Doctor';

    try {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          farmerUserId,
          'New Prescription',
          `Dr. ${doctorName} has created a new prescription for you. Prescription No: ${prescriptionNo}`,
          'prescription_created'
        ]
      );
      console.log('✅ Standalone prescription notification sent to farmer');
    } catch (notifError) {
      console.warn('⚠️ Failed to send standalone prescription notification:', notifError.message);
      // Continue anyway - prescription was created successfully
    }

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId: result.insertId,
      prescriptionNo: prescriptionNo
    });

  } catch (error) {
    console.error('Error creating standalone prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Prescriptions endpoints
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Only doctors can create prescriptions.' });
    }

    const { appointmentId, diagnosis, treatment, medicines, instructions, followUpDate } = req.body;
    const doctorUserId = req.user.userId;

    // Get doctor ID
    const [docRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [doctorUserId]);
    if (docRows.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    const doctorId = docRows[0].id;

    // Get appointment and farmer details
    const [appointmentRows] = await db.execute(
      'SELECT a.farmer_id, f.user_id as farmer_user_id FROM appointments a JOIN farmers f ON a.farmer_id = f.id WHERE a.id = ? AND a.doctor_id = ?',
      [appointmentId, doctorId]
    );

    if (appointmentRows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const farmerId = appointmentRows[0].farmer_id;
    const farmerUserId = appointmentRows[0].farmer_user_id;

    // Generate unique prescription number
    const prescriptionNo = 'RX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Insert prescription
    const [result] = await db.execute(`
      INSERT INTO prescriptions 
      (prescription_no, appointment_id, doctor_id, farmer_id, diagnosis, treatment, medicines, instructions, follow_up_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      prescriptionNo,
      appointmentId,
      doctorId,
      farmerId,
      diagnosis || '',
      treatment || '',
      JSON.stringify(medicines || []),
      instructions || '',
      followUpDate || null
    ]);

    // Send notification to farmer (don't fail prescription creation if notification fails)
    const [doctorInfo] = await db.execute('SELECT u.name FROM users u JOIN doctors d ON u.id = d.user_id WHERE d.id = ?', [doctorId]);
    const doctorName = doctorInfo[0]?.name || 'Doctor';

    try {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          farmerUserId,
          'New Prescription',
          `Dr. ${doctorName} has created a new prescription for you. Prescription No: ${prescriptionNo}`,
          'prescription_created'
        ]
      );
      console.log('✅ Prescription notification sent to farmer');
    } catch (notifError) {
      console.warn('⚠️ Failed to send prescription notification:', notifError.message);
      // Continue anyway - prescription was created successfully
    }

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId: result.insertId,
      prescriptionNo: prescriptionNo
    });

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

app.get('/api/prescriptions/farmer', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') return res.status(403).json({ error: 'Not a farmer' });
    const farmerUserId = req.user.userId;

    // find farmer id
    const [farmerRows] = await db.execute('SELECT id, user_id FROM farmers WHERE user_id = ?', [farmerUserId]);
    if (farmerRows.length === 0) return res.json([]);
    const farmerId = farmerRows[0].id;

    const [pres] = await db.execute('SELECT * FROM prescriptions WHERE farmer_id = ? ORDER BY created_at DESC', [farmerId]);
    res.json(pres);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Medicine shops
app.get('/api/medicine-shops', async (req, res) => {
  try {
    const [shops] = await db.execute('SELECT * FROM medicine_shops ORDER BY name');
    res.json(shops);
  } catch (error) {
    console.error('Error fetching medicine shops:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get shop details with available medicines
app.get('/api/medicine-shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [shopRows] = await db.execute('SELECT * FROM medicine_shops WHERE id = ?', [id]);
    
    if (shopRows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Get available medicines for this shop (mock data for now)
    const availableMedicines = [
      { name: 'Mancozeb 75% WP', price: 250, available: true, stock: 50 },
      { name: 'Carbendazim 50% WP', price: 180, available: true, stock: 30 },
      { name: 'Imidacloprid 17.8% SL', price: 320, available: true, stock: 25 },
      { name: 'Lambda Cyhalothrin 5% EC', price: 280, available: false, stock: 0 },
      { name: 'Copper Sulfate', price: 150, available: true, stock: 100 }
    ];
    
    res.json({
      shop: shopRows[0],
      medicines: availableMedicines
    });
  } catch (error) {
    console.error('Error fetching shop details:', error);
    res.status(500).json({ error: 'Failed to fetch shop details' });
  }
});

// Check medicine availability for prescription
app.post('/api/medicine-shops/check-availability', async (req, res) => {
  try {
    const { shopId, prescriptionMedicines } = req.body;
    
    // Get shop info
    const [shopRows] = await db.execute('SELECT * FROM medicine_shops WHERE id = ?', [shopId]);
    if (shopRows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Mock medicine availability check
    const medicineAvailability = prescriptionMedicines.map(medicine => ({
      ...medicine,
      available: Math.random() > 0.2, // 80% availability
      price: Math.floor(Math.random() * 300) + 100,
      stock: Math.floor(Math.random() * 50) + 10
    }));
    
    res.json({
      shop: shopRows[0],
      medicines: medicineAvailability
    });
  } catch (error) {
    console.error('Error checking medicine availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Orders
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') return res.status(403).json({ error: 'Not a farmer' });
    const farmerUserId = req.user.userId;
    const { shopId, items, totalAmount } = req.body;

    // find farmer id
    const [farmerRows] = await db.execute('SELECT id FROM farmers WHERE user_id = ?', [farmerUserId]);
    const farmerId = farmerRows.length ? farmerRows[0].id : null;

    const [result] = await db.execute(
      'INSERT INTO medicine_orders (farmer_id, shop_id, items, total_amount) VALUES (?, ?, ?, ?)',
      [farmerId, shopId || null, JSON.stringify(items || []), totalAmount || 0]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/farmer', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') return res.status(403).json({ error: 'Not a farmer' });
    const farmerUserId = req.user.userId;
    const [farmerRows] = await db.execute('SELECT id FROM farmers WHERE user_id = ?', [farmerUserId]);
    const farmerId = farmerRows.length ? farmerRows[0].id : null;
    if (!farmerId) return res.json([]);

    const [orders] = await db.execute('SELECT * FROM medicine_orders WHERE farmer_id = ? ORDER BY created_at DESC', [farmerId]);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ===== STANDALONE PRESCRIPTION SYSTEM =====

// Get all medicines for prescription
app.get('/api/medicines', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Only doctors can access medicines.' });
    }

    const [medicines] = await db.execute(
      'SELECT * FROM medicines ORDER BY category, name'
    );

    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// Get all vaccines for prescription
app.get('/api/vaccines', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Only doctors can access vaccines.' });
    }

    const [vaccines] = await db.execute(
      'SELECT * FROM vaccines ORDER BY animal_type, name'
    );

    res.json(vaccines);
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    res.status(500).json({ error: 'Failed to fetch vaccines' });
  }
});

// Get all farmers for prescription selection
app.get('/api/farmers/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Only doctors can access farmer list.' });
    }

    const [farmers] = await db.execute(`
      SELECT f.id, u.name, u.phone, u.email, f.address, f.farm_type, f.farm_size, f.experience_years
      FROM farmers f
      JOIN users u ON f.user_id = u.id
      WHERE u.user_type = 'farmer'
      ORDER BY u.name
    `);

    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// Get all prescriptions created by a doctor (for doctor dashboard)
app.get('/api/prescriptions/doctor', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doctorUserId = req.user.userId;
    
    // Get doctor ID
    const [doctorRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [doctorUserId]);
    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    const doctorId = doctorRows[0].id;

    const [prescriptions] = await db.execute(`
      SELECT 
        p.*,
        fu.name as farmer_name,
        fu.phone as farmer_phone,
        fu.email as farmer_email,
        f.address as farmer_address,
        f.farm_type,
        du.name as doctor_name,
        d.specialization
      FROM prescriptions p
      LEFT JOIN farmers f ON p.farmer_id = f.id
      LEFT JOIN users fu ON f.user_id = fu.id
      LEFT JOIN doctors d ON p.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE p.doctor_id = ?
      ORDER BY p.created_at DESC
    `, [doctorId]);

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// ===== END STANDALONE PRESCRIPTION SYSTEM =====

// Notifications
app.post('/api/notifications', async (req, res) => {
  try {
    const { userType, userId, title, message } = req.body;
    const [result] = await db.execute('INSERT INTO notifications (user_type, user_id, title, message) VALUES (?, ?, ?, ?)', [userType, userId, title, message]);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.get('/api/notifications/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const [rows] = await db.execute('SELECT * FROM notifications WHERE user_type = ? AND user_id = ? ORDER BY created_at DESC', [userType, userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notifications for authenticated farmer
app.get('/api/notifications/farmer', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM notifications WHERE user_type = ? AND user_id = ? ORDER BY created_at DESC', ['farmer', req.user.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching farmer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch farmer notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get farmer's appointments
app.get('/api/appointments/farmer', authenticateToken, async (req, res) => {
  try {
    // Verify user is a farmer
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, limit = 50, offset = 0 } = req.query;

    // Get farmer ID
    const [farmerRows] = await db.execute('SELECT id FROM farmers WHERE user_id = ?', [req.user.userId]);
    if (farmerRows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    const farmerId = farmerRows[0].id;

    let query = `
      SELECT 
        a.*,
        u.name as doctor_name,
        d.specialization,
        d.workplace
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.farmer_id = ?
    `;
    let params = [farmerId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    console.log('Executing farmer appointments query:', query);
    console.log('With parameters:', params);

    const [appointments] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM appointments WHERE farmer_id = ?';
    let countParams = [farmerId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      appointments,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching farmer appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Appointment Routes
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    console.log('Appointment request received:', req.body);
    console.log('User from token:', req.user);
    
    // Accept frontend fields (removed fee since no payment required)
    const { doctorId, appointmentDate, appointmentTime, problemDescription, problem, farmType, urgency, googleMeetLink } = req.body;
    
    // Require doctor selection
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor selection is required' });
    }
    
    // Get farmer ID from user
    const [farmerData] = await db.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (farmerData.length === 0) {
      console.log('Farmer not found for user_id:', req.user.userId);
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    const farmerId = farmerData[0].id;
    console.log('Found farmer ID:', farmerId);
    
    // Check if farmer already has appointment with this doctor at same time
    const [conflicts] = await db.execute(
      'SELECT id FROM appointments WHERE farmer_id = ? AND doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status IN ("pending", "confirmed")',
      [farmerId, doctorId, appointmentDate, appointmentTime]
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'You already have a pending appointment with this doctor at this time' });
    }
    
    // Use problemDescription if provided, else fallback to problem
    const desc = problemDescription || problem || '';

    // Create appointment with pending status (doctor needs to approve)
    const [result] = await db.execute(
      'INSERT INTO appointments (farmer_id, doctor_id, appointment_date, appointment_time, problem_description, google_meet_link, farm_type, urgency, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [farmerId, doctorId, appointmentDate, appointmentTime, desc, googleMeetLink || null, farmType, urgency, 'pending']
    );
    
    // Get doctor's user_id for notification
    const [doctorUser] = await db.execute(
      'SELECT user_id, name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [doctorId]
    );

    // Try to send notification to doctor (don't fail if notification fails)
    if (doctorUser.length > 0) {
      try {
        await db.execute(
          'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())',
          [doctorUser[0].user_id, 'New Appointment Request', `New appointment request from farmer. Date: ${appointmentDate} ${appointmentTime}`, 'appointment_request']
        );
        console.log('✅ Notification sent to doctor');
      } catch (notifError) {
        console.warn('⚠️ Failed to send notification to doctor:', notifError.message);
        // Continue anyway - appointment was created successfully
      }
    }

    console.log(`Appointment created: farmer=${farmerId}, doctor=${doctorId}, date=${appointmentDate} ${appointmentTime}`);
    res.status(201).json({ 
      message: 'Appointment booked successfully. Doctor will be notified.',
      appointmentId: result.insertId,
      status: 'pending'
    });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get prescription details for download (PDF generation)
app.get('/api/prescriptions/:id/download', authenticateToken, async (req, res) => {
  try {
    const prescriptionId = req.params.id;

    // Get prescription with doctor and farmer details
    const [prescription] = await db.execute(
      `SELECT p.*, 
              d.qualification as doctor_qualification,
              d.specialization as doctor_specialization, 
              d.workplace,
              du.name as doctor_name,
              du.phone as doctor_phone,
              du.email as doctor_email,
              f.address as farmer_address,
              f.farm_type,
              fu.name as farmer_name,
              fu.phone as farmer_phone,
              fu.email as farmer_email
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       LEFT JOIN users du ON d.user_id = du.id
       LEFT JOIN farmers f ON p.farmer_id = f.id
       LEFT JOIN users fu ON f.user_id = fu.id
       WHERE p.id = ? AND (f.user_id = ? OR d.user_id = ?)`,
      [prescriptionId, req.user.userId, req.user.userId]
    );

    if (prescription.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const presc = prescription[0];
    presc.medicines = JSON.parse(presc.medicines || '[]');

    res.json(presc);

  } catch (error) {
    console.error('Error fetching prescription for download:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Get farmer profile
app.get('/api/farmer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied. Only farmers can access this.' });
    }

    const [farmers] = await db.execute(
      `SELECT u.name, u.phone, u.email, f.farmer_name, f.address, f.farm_type, f.farm_size, f.experience_years
       FROM users u
       JOIN farmers f ON u.id = f.user_id
       WHERE u.id = ? AND u.user_type = 'farmer'`,
      [req.user.userId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const farmer = farmers[0];
    res.json({
      name: farmer.name,
      phone: farmer.phone,
      email: farmer.email,
      farmerName: farmer.farmer_name || farmer.name, // Use farmer_name if available, fallback to user name
      address: farmer.address,
      farmType: farmer.farm_type,
      farmSize: farmer.farm_size,
      experienceYears: farmer.experience_years
    });

  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    res.status(500).json({ error: 'Failed to fetch farmer profile' });
  }
});

// Update farmer profile
app.put('/api/farmer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied. Only farmers can update this.' });
    }

    const { name, farmerName, address, farmType, farmSize, experienceYears } = req.body;

    // Update user table
    await db.execute(
      'UPDATE users SET name = ? WHERE id = ? AND user_type = ?',
      [name, req.user.userId, 'farmer']
    );

    // Update farmers table
    await db.execute(
      'UPDATE farmers SET farmer_name = ?, address = ?, farm_type = ?, farm_size = ?, experience_years = ? WHERE user_id = ?',
      [farmerName || name, address, farmType, farmSize || 0, experienceYears || 0, req.user.userId]
    );

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating farmer profile:', error);
    res.status(500).json({ error: 'Failed to update farmer profile' });
  }
});

// ===================================
// COMPREHENSIVE CRUD ENDPOINTS
// ===================================

// FARMERS CRUD
// Get all farmers (for admin/doctor view)
app.get('/api/farmers', authenticateToken, async (req, res) => {
  try {
    const [farmers] = await db.execute(
      `SELECT f.id, f.user_id, f.farmer_name, u.name, u.phone, u.email, 
              f.address, f.farm_type, f.farm_size, f.experience_years, 
              u.created_at
       FROM farmers f
       JOIN users u ON f.user_id = u.id
       ORDER BY u.created_at DESC`
    );

    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// Get single farmer by ID
app.get('/api/farmers/:id', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.params.id;
    
    const [farmers] = await db.execute(
      `SELECT f.id, f.user_id, f.farmer_name, u.name, u.phone, u.email,
              f.address, f.farm_type, f.farm_size, f.experience_years,
              u.created_at, u.updated_at
       FROM farmers f
       JOIN users u ON f.user_id = u.id
       WHERE f.id = ?`,
      [farmerId]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json(farmers[0]);
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ error: 'Failed to fetch farmer' });
  }
});

// Update farmer information (admin/doctor can edit any farmer)
app.put('/api/farmers/:id', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.params.id;
    const { farmerName, name, phone, email, address, farmType, farmSize, experienceYears } = req.body;

    // First check if farmer exists
    const [farmers] = await db.execute('SELECT user_id FROM farmers WHERE id = ?', [farmerId]);
    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const userId = farmers[0].user_id;

    // Update user table
    await db.execute(
      'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
      [name, phone, email || null, userId]
    );

    // Update farmers table
    await db.execute(
      'UPDATE farmers SET farmer_name = ?, address = ?, farm_type = ?, farm_size = ?, experience_years = ? WHERE id = ?',
      [farmerName || name, address, farmType, farmSize || 0, experienceYears || 0, farmerId]
    );

    res.json({ message: 'Farmer updated successfully' });

  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({ error: 'Failed to update farmer' });
  }
});

// Delete farmer
app.delete('/api/farmers/:id', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.params.id;

    // Get user_id first
    const [farmers] = await db.execute('SELECT user_id FROM farmers WHERE id = ?', [farmerId]);
    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const userId = farmers[0].user_id;

    // Delete farmer (this will cascade delete from users table due to foreign key)
    await db.execute('DELETE FROM farmers WHERE id = ?', [farmerId]);
    
    // Also delete from users table
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Farmer deleted successfully' });

  } catch (error) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({ error: 'Failed to delete farmer' });
  }
});

// DOCTORS CRUD
// Get all doctors
app.get('/api/doctors/all', authenticateToken, async (req, res) => {
  try {
    const [doctors] = await db.execute(
      `SELECT d.id, d.user_id, u.name, u.phone, u.email,
              d.qualification, d.specialization, d.experience_years, 
              d.workplace, d.license_number, d.available_time_start,
              d.available_time_end, d.available_days, d.consultation_fee,
              u.created_at
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       ORDER BY u.created_at DESC`
    );

    // Parse available_days JSON
    const doctorsWithParsedDays = doctors.map(doctor => ({
      ...doctor,
      available_days: JSON.parse(doctor.available_days || '[]')
    }));

    res.json(doctorsWithParsedDays);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get single doctor by ID
app.get('/api/doctors/:id', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    const [doctors] = await db.execute(
      `SELECT d.id, d.user_id, u.name, u.phone, u.email,
              d.qualification, d.specialization, d.experience_years,
              d.workplace, d.license_number, d.available_time_start,
              d.available_time_end, d.available_days, d.consultation_fee,
              u.created_at, u.updated_at
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = {
      ...doctors[0],
      available_days: JSON.parse(doctors[0].available_days || '[]')
    };

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Update doctor information
app.put('/api/doctors/:id', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { 
      name, phone, email, qualification, specialization, 
      experienceYears, workplace, licenseNumber, availableTimeStart,
      availableTimeEnd, availableDays, consultationFee 
    } = req.body;

    // First check if doctor exists
    const [doctors] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const userId = doctors[0].user_id;

    // Update user table
    await db.execute(
      'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
      [name, phone, email || null, userId]
    );

    // Update doctors table
    await db.execute(
      `UPDATE doctors SET 
       qualification = ?, specialization = ?, experience_years = ?,
       workplace = ?, license_number = ?, available_time_start = ?,
       available_time_end = ?, available_days = ?, consultation_fee = ?
       WHERE id = ?`,
      [
        qualification, specialization, experienceYears || 0,
        workplace, licenseNumber, availableTimeStart,
        availableTimeEnd, JSON.stringify(availableDays || []), consultationFee || 0,
        doctorId
      ]
    );

    res.json({ message: 'Doctor updated successfully' });

  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// Delete doctor
app.delete('/api/doctors/:id', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Get user_id first
    const [doctors] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const userId = doctors[0].user_id;

    // Delete doctor
    await db.execute('DELETE FROM doctors WHERE id = ?', [doctorId]);
    
    // Also delete from users table
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Doctor deleted successfully' });

  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// APPOINTMENTS CRUD
// Get all appointments (admin view)
app.get('/api/appointments/all', authenticateToken, async (req, res) => {
  try {
    const [appointments] = await db.execute(
      `SELECT a.*, 
              u_farmer.name as farmer_name, u_farmer.phone as farmer_phone,
              f.address as farmer_address, f.farm_type as farmer_farm_type,
              u_doctor.name as doctor_name, u_doctor.phone as doctor_phone,
              d.specialization as doctor_specialization, d.workplace as doctor_workplace
       FROM appointments a
       JOIN farmers f ON a.farmer_id = f.id
       JOIN users u_farmer ON f.user_id = u_farmer.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doctor ON d.user_id = u_doctor.id
       ORDER BY a.created_at DESC`
    );

    res.json(appointments);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
  catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
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

// Create new appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { 
      farmerId, doctorId, appointmentDate, appointmentTime, 
      problemDescription, farmType, urgency, fee 
    } = req.body;

    // Validate required fields
    if (!farmerId || !doctorId || !appointmentDate || !appointmentTime || !problemDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert appointment
    const [result] = await db.execute(
      `INSERT INTO appointments 
       (farmer_id, doctor_id, appointment_date, appointment_time, 
        problem_description, farm_type, urgency, status, fee) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [farmerId, doctorId, appointmentDate, appointmentTime, 
       problemDescription, farmType, urgency || 'normal', fee || 0]
    );

    // Create notification for doctor
    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_id, created_at)
       VALUES (
         (SELECT user_id FROM doctors WHERE id = ?), 
         'appointment_request', 
         'New Appointment Request', 
         ?, 
         ?, 
         NOW()
       )`,
      [
        doctorId,
        `New appointment request from farmer for ${problemDescription}`,
        result.insertId
      ]
    );

    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointmentId: result.insertId 
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { 
      appointmentDate, appointmentTime, problemDescription, 
      farmType, urgency, status, consultationNotes, fee, googleMeetLink 
    } = req.body;

    // Check if appointment exists
    const [appointments] = await db.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment
    await db.execute(
      `UPDATE appointments SET 
       appointment_date = ?, appointment_time = ?, problem_description = ?,
       farm_type = ?, urgency = ?, status = ?, consultation_notes = ?,
       fee = ?, google_meet_link = ?
       WHERE id = ?`,
      [
        appointmentDate, appointmentTime, problemDescription,
        farmType, urgency, status, consultationNotes,
        fee, googleMeetLink, appointmentId
      ]
    );

    // If status changed to confirmed or cancelled, notify farmer
    if (status === 'confirmed' || status === 'cancelled') {
      const appointment = appointments[0];
      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message, related_id, created_at)
         VALUES (
           (SELECT user_id FROM farmers WHERE id = ?), 
           'appointment_${status}', 
           'Appointment ${status}', 
           ?, 
           ?, 
           NOW()
         )`,
        [
          appointment.farmer_id,
          `Your appointment has been ${status}`,
          appointmentId
        ]
      );
    }

    res.json({ message: 'Appointment updated successfully' });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Check if appointment exists
    const [appointments] = await db.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Delete appointment
    await db.execute('DELETE FROM appointments WHERE id = ?', [appointmentId]);

    res.json({ message: 'Appointment deleted successfully' });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Get farmer appointments with pagination
app.get('/api/appointments/farmer', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied. Only farmers can access this.' });
    }

    // Get farmer ID from user ID
    const [farmerRows] = await db.execute('SELECT id FROM farmers WHERE user_id = ?', [req.user.userId]);
    if (farmerRows.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    const farmerId = farmerRows[0].id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [appointments] = await db.execute(
      `SELECT 
        a.*,
        u.name as doctor_name,
        d.specialization,
        d.workplace
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.farmer_id = ?
      ORDER BY a.created_at DESC 
      LIMIT ? OFFSET ?`,
      [farmerId, limit, offset]
    );

    // Get total count
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE farmer_id = ?',
      [farmerId]
    );
    const total = countResult[0].total;

    res.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching farmer appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
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
