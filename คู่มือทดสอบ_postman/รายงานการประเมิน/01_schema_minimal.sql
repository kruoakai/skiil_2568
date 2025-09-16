
-- schema_minimal.sql
CREATE DATABASE IF NOT EXISTS evaluation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE evaluation;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name_th VARCHAR(191) NOT NULL,
  role ENUM('admin','evaluator','evaluatee') NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  buddhist_year INT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluation_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name_th VARCHAR(191) NOT NULL,
  description TEXT,
  weight INT,
  order_no INT
);

CREATE TABLE IF NOT EXISTS indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  code VARCHAR(100) NOT NULL,
  name_th VARCHAR(191) NOT NULL,
  description TEXT,
  type ENUM('score_1_4','yes_no','file_url') NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  UNIQUE KEY uk_indicator (topic_id, code),
  CONSTRAINT fk_ind_topic FOREIGN KEY (topic_id) REFERENCES evaluation_topics(id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL,
  evaluator_id INT NOT NULL,
  evaluatee_id INT NOT NULL,
  topic_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_assign (period_id, evaluator_id, evaluatee_id, topic_id),
  FOREIGN KEY (period_id) REFERENCES periods(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id),
  FOREIGN KEY (evaluatee_id) REFERENCES users(id),
  FOREIGN KEY (topic_id) REFERENCES evaluation_topics(id)
);

CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL,
  evaluator_id INT NOT NULL,
  evaluatee_id INT NOT NULL,
  topic_id INT NOT NULL,
  indicator_id INT NOT NULL,
  score TINYINT,
  yes_no TINYINT(1),
  note TEXT,
  status ENUM('draft','submitted') DEFAULT 'draft',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_result (period_id, evaluator_id, evaluatee_id, topic_id, indicator_id),
  FOREIGN KEY (period_id) REFERENCES periods(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id),
  FOREIGN KEY (evaluatee_id) REFERENCES users(id),
  FOREIGN KEY (topic_id) REFERENCES evaluation_topics(id),
  FOREIGN KEY (indicator_id) REFERENCES indicators(id)
);

CREATE TABLE IF NOT EXISTS evidence_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name_th VARCHAR(191) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL,
  evaluatee_id INT NOT NULL,
  indicator_id INT NOT NULL,
  evidence_type_id INT NOT NULL,
  filename VARCHAR(255),
  mime VARCHAR(100),
  size INT,
  storage_path VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_att_triplet (period_id, evaluatee_id, indicator_id),
  FOREIGN KEY (period_id) REFERENCES periods(id),
  FOREIGN KEY (evaluatee_id) REFERENCES users(id),
  FOREIGN KEY (indicator_id) REFERENCES indicators(id),
  FOREIGN KEY (evidence_type_id) REFERENCES evidence_types(id)
);
