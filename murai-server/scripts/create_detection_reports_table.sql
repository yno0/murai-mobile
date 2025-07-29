-- Create detection_reports table for storing extension detection reports
CREATE TABLE IF NOT EXISTS detection_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  type ENUM('automatic_detection', 'flagged_word', 'selected_text') NOT NULL,
  content TEXT NOT NULL,
  reason VARCHAR(100) NULL,
  comment TEXT NULL,
  context TEXT NULL,
  terms_count INT NULL,
  language VARCHAR(50) NULL,
  sensitivity VARCHAR(20) NULL,
  url TEXT NOT NULL,
  user_agent TEXT NULL,
  domain VARCHAR(255) NULL,
  timestamp DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_user_email (user_email),
  INDEX idx_type (type),
  INDEX idx_domain (domain),
  INDEX idx_created_at (created_at),
  INDEX idx_timestamp (timestamp)
);

-- Add some sample data for testing
INSERT INTO detection_reports (
  user_id, 
  user_email, 
  type, 
  content, 
  reason, 
  comment, 
  context, 
  terms_count, 
  language, 
  sensitivity, 
  url, 
  user_agent, 
  domain, 
  timestamp
) VALUES 
(1, 'test@example.com', 'automatic_detection', 'inappropriate, content', NULL, NULL, 'This is some sample context with inappropriate content detected', 2, 'Mixed', 'High', 'https://example.com/page1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'example.com', NOW()),
(1, 'test@example.com', 'flagged_word', 'badword', 'false-positive', 'This word was incorrectly flagged', NULL, NULL, 'English', 'Medium', 'https://facebook.com/post123', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'facebook.com', NOW()),
(1, 'test@example.com', 'selected_text', 'selected inappropriate text', 'offensive', 'User reported this as offensive', NULL, NULL, 'Tagalog', 'High', 'https://twitter.com/status456', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'twitter.com', NOW());
