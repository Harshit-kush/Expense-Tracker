CREATE DATABASE IF NOT EXISTS expense_tracker_db;
USE expense_tracker_db;
CREATE TABLE IF NOT EXISTS transactions(
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);