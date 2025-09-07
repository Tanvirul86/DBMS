-- Grameen Krishi Database Schema
-- MySQL Database Setup for Farmer Registration and Authentication

-- Create database
CREATE DATABASE IF NOT EXISTS grameen_krishi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grameen_krishi;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS farmers;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- Create users table (main authentication table)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('farmer', 'doctor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_user_type (user_type),
    INDEX idx_created_at (created_at)
);

-- Create farmers table (farmer-specific details)
CREATE TABLE farmers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address TEXT,
    farm_type VARCHAR(50),
    custom_farm_type VARCHAR(100),
    farm_size DECIMAL(10,2),
    experience_years INT,
    crops VARCHAR(500),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_verification_status (verification_status)
);

-- Create doctors table (doctor-specific details)
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100),
    license_number VARCHAR(50),
    hospital_clinic VARCHAR(255),
    address TEXT,
    consultation_fee DECIMAL(8,2),
    experience_years INT,
    availability_schedule JSON,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_specialization (specialization),
    INDEX idx_verification_status (verification_status)
);

-- Create consultations table (for future use)
CREATE TABLE consultations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    doctor_id INT NOT NULL,
    consultation_type ENUM('chat', 'video', 'phone') NOT NULL,
    status ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'requested',
    scheduled_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    fee_amount DECIMAL(8,2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    farmer_notes TEXT,
    doctor_diagnosis TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
);

-- Insert sample data for testing
INSERT INTO users (name, phone, password_hash, user_type) VALUES 
('Test Farmer', '01700000001', '$2a$10$example_hash_for_password123', 'farmer'),
('Dr. Test Doctor', '01700000002', '$2a$10$example_hash_for_password123', 'doctor');

INSERT INTO farmers (user_id, address, farm_type, custom_farm_type) VALUES 
(1, 'Dhaka, Bangladesh', 'crop', 'Rice and Wheat');

INSERT INTO doctors (user_id, specialization, license_number, hospital_clinic) VALUES 
(2, 'Agricultural Medicine', 'DOC123456', 'Agricultural Health Center');

-- Check data
SELECT 'Users Table:' as table_name;
SELECT * FROM users;

SELECT 'Farmers Table:' as table_name;
SELECT * FROM farmers;

SELECT 'Doctors Table:' as table_name;
SELECT * FROM doctors;

-- Show table structures
DESCRIBE users;
DESCRIBE farmers;
DESCRIBE doctors;
