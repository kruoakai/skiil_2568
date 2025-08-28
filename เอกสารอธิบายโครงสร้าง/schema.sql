-- Minimal schema for teaching (derived from backend_v3 core concepts)
CREATE DATABASE IF NOT EXISTS evaluation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE evaluation;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','evaluator','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@example.com', '$2b$10$KQj1x6mXrJ2NqC8aK9y0Pu2r0dpg12nF6H6pE7l4QGfrxgkS8JqFS', 'admin'); 
-- password for admin@example.com is: admin1234 (bcrypt hash pre-generated)
