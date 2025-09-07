# Grameen Krishi Backend Setup Instructions

## 📋 Prerequisites
- Node.js (version 14 or higher)
- MySQL Server (version 5.7 or higher)
- npm or yarn package manager

## 🚀 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
1. Start your MySQL server
2. Create database and tables:
   ```bash
   mysql -u root -p < database_schema.sql
   ```

### 3. Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Update `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=grameen_krishi
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

### 4. Add API Routes to server_old.js

Add these routes to your `server_old.js` file:

```javascript
// Add these imports at the top
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Add JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Copy all API routes from farmer-api-routes.js and paste them in server_old.js
```

## 🔧 API Integration Guide

### Frontend API Calls

Your React components (`FarmerRegistration.js` and `FarmerLogin.js`) are already configured to make API calls to:

1. **Registration**: `POST /api/farmer/register`
2. **Login**: `POST /api/farmer/login`
3. **Check User**: `POST /api/farmer/check`

### Authentication Flow

1. **Registration**:
   - User fills form → Frontend sends data to `/api/farmer/register`
   - Backend hashes password → Saves to database
   - Returns success message

2. **Login**:
   - User enters phone/password → Frontend sends to `/api/farmer/login`
   - Backend checks database → Verifies password
   - If user not found → Returns "Don't have account, Register"
   - If found → Returns JWT token and user data

## 🧪 Testing

1. Start backend server:
   ```bash
   npm run dev
   ```

2. Test registration:
   ```bash
   curl -X POST http://localhost:5000/api/farmer/register \
   -H "Content-Type: application/json" \
   -d '{
     "name": "Test Farmer",
     "phone": "01700000001",
     "password": "password123",
     "farmType": "crop",
     "address": "Dhaka"
   }'
   ```

3. Test login:
   ```bash
   curl -X POST http://localhost:5000/api/farmer/login \
   -H "Content-Type: application/json" \
   -d '{
     "phone": "01700000001",
     "password": "password123"
   }'
   ```

## 🎯 Next Steps

1. ✅ All code files are created
2. ✅ Database schema is ready
3. ✅ Frontend components are integrated
4. 🔄 Start MySQL server when ready to test
5. 🔄 Run backend server for testing
6. 🔄 Test complete registration/login flow

## 📁 File Structure
```
backend/
├── server_old.js (your existing server)
├── farmer-api-routes.js (API routes to copy)
├── database_schema.sql (database setup)
├── package.json (dependencies)
├── .env.example (environment template)
└── README.md (this file)
```

## 🔍 Troubleshooting

- **Database Connection Error**: Check MySQL server is running and credentials are correct
- **JWT Error**: Make sure JWT_SECRET is set in .env file
- **CORS Error**: Ensure CORS is enabled for your frontend URL
- **Registration Fails**: Check if phone number already exists in database
