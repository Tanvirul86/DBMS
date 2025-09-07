-- Database Schema for server_old.js compatibility
-- This matches your existing server_old.js structure

-- Use your existing database
USE cloudfarm;

-- Add password field to existing farmer table (if not exists)
-- Note: This assumes your current farmer table exists

-- Check current farmer table structure first:
DESCRIBE farmer;

-- Add password column for authentication (if not exists)
ALTER TABLE farmer 
ADD COLUMN farmer_password VARCHAR(255) AFTER farmer_phn;

-- Create index on phone for faster login
CREATE INDEX idx_farmer_phn ON farmer(farmer_phn);

-- Sample data for testing (optional)
-- INSERT INTO farmer (farmer_name, farmer_phn, farmer_password, farmer_add, farm_type) 
-- VALUES ('Test Farmer', '01700000001', '$2a$10$example_hash_for_password123', 'Dhaka, Bangladesh', 'crop');

-- Show updated table structure
DESCRIBE farmer;
SELECT * FROM farmer LIMIT 5;
