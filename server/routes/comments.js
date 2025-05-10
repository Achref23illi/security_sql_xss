const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isSecurityEnabled } = require('../config/security');

// Helper function to sanitize user input (for XSS prevention)
function sanitizeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const securityEnabled = await isSecurityEnabled();
    
    let comments;
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [result] = await db.query(
        `SELECT c.*, u.username 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`,
        [postId]
      );
      
      comments = result;
    } else {
      // Insecure version - SQL Injection vulnerability
      // WARNING: This is intentionally vulnerable for demonstration
      const query = `SELECT c.*, u.username 
                     FROM comments c
                     JOIN users u ON c.user_id = u.id
                     WHERE c.post_id = ${postId}
                     ORDER BY c.created_at DESC`;
      
      const [result] = await db.query(query);
      comments = result;
    }
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Add a new comment
router.post('/', async (req, res) => {
  try {
    const { content, userId, postId } = req.body;
    const securityEnabled = await isSecurityEnabled();
    
    let newComment;
    
    if (securityEnabled) {
      // Secure version - Sanitize input to prevent XSS and use parameterized queries
      const sanitizedContent = sanitizeHtml(content);
      
      const [result] = await db.query(
        'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)',
        [sanitizedContent, userId, postId]
      );
      
      newComment = {
        id: result.insertId,
        content: sanitizedContent,
        user_id: userId,
        post_id: postId,
        created_at: new Date()
      };
    } else {
      // Insecure version - XSS vulnerability
      // WARNING: This is intentionally vulnerable for demonstration
      const query = `INSERT INTO comments (content, user_id, post_id) 
                     VALUES ('${content}', ${userId}, ${postId})`;
      
      const [result] = await db.query(query);
      
      newComment = {
        id: result.insertId,
        content: content, // Not sanitized - XSS vulnerability
        user_id: userId,
        post_id: postId,
        created_at: new Date()
      };
    }
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Get all posts (for the forum)
router.get('/posts', async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.*, u.username, COUNT(c.id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN comments c ON p.id = c.post_id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get single post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const securityEnabled = await isSecurityEnabled();
    
    let post;
    let comments;
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [posts] = await db.query(
        `SELECT p.*, u.username 
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [id]
      );
      
      if (posts.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      post = posts[0];
      
      const [commentsResult] = await db.query(
        `SELECT c.*, u.username 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`,
        [id]
      );
      
      comments = commentsResult;
    } else {
      // Insecure version - SQL Injection vulnerability
      // WARNING: This is intentionally vulnerable for demonstration
      const postQuery = `SELECT p.*, u.username 
                         FROM posts p
                         JOIN users u ON p.user_id = u.id
                         WHERE p.id = ${id}`;
      
      const [posts] = await db.query(postQuery);
      
      if (posts.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      post = posts[0];
      
      const commentsQuery = `SELECT c.*, u.username 
                             FROM comments c
                             JOIN users u ON c.user_id = u.id
                             WHERE c.post_id = ${id}
                             ORDER BY c.created_at DESC`;
      
      const [commentsResult] = await db.query(commentsQuery);
      comments = commentsResult;
    }
    
    res.json({ post, comments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

module.exports = router;