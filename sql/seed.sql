-- Use the database
USE security_demo;

-- Insert sample users (password is 'password123' for all)
-- In a real application, passwords should be properly hashed
INSERT INTO users (username, email, password, is_admin) VALUES
('admin', 'admin@example.com', 'password123', TRUE),
('john', 'john@example.com', 'password123', FALSE),
('jane', 'jane@example.com', 'password123', FALSE);

-- Insert sample posts
INSERT INTO posts (title, content, user_id) VALUES
('Welcome to our forum', 'This is the first post on our forum. Feel free to leave comments!', 1),
('SQL Injection Tutorial', 'Learn how SQL injection works and how to prevent it.', 1),
('XSS Security', 'Cross-site scripting (XSS) is a type of security vulnerability.', 2);

-- Insert sample comments
INSERT INTO comments (content, user_id, post_id) VALUES
('Great post! Looking forward to more content.', 2, 1),
('Thanks for sharing this information.', 3, 2),
('Very helpful tutorial on security.', 3, 3);