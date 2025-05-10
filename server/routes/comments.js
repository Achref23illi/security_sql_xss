const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isSecurityEnabled } = require('../config/security');
// Add DOMPurify for XSS protection
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Initialize DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Get all posts with comment counts
router.get('/posts', async (req, res) => {
  try {
    const securityEnabled = await isSecurityEnabled();
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [posts] = await db.query(`
        SELECT p.*, u.username, COUNT(c.id) as comment_count
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN comments c ON p.id = c.post_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);
      
      res.json(posts);
    } else {
      // Insecure version - Same query but demonstrates that we handle both secure and insecure paths
      const query = `
        SELECT p.*, u.username, COUNT(c.id) as comment_count
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN comments c ON p.id = c.post_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      
      const [posts] = await db.query(query);
      res.json(posts);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      message: 'Error fetching posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a specific post with its comments
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const securityEnabled = await isSecurityEnabled();
    
    let post, comments;
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [posts] = await db.query(
        `SELECT p.*, u.username 
         FROM posts p 
         LEFT JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [id]
      );
      
      if (posts.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      post = posts[0];
      
      const [commentRows] = await db.query(
        `SELECT c.*, u.username 
         FROM comments c 
         LEFT JOIN users u ON c.user_id = u.id 
         WHERE c.post_id = ? 
         ORDER BY c.created_at DESC`,
        [id]
      );
      
      comments = commentRows;
    } else {
      // Insecure version - SQL injection vulnerability
      const postQuery = `SELECT p.*, u.username 
                         FROM posts p 
                         LEFT JOIN users u ON p.user_id = u.id 
                         WHERE p.id = '${id}'`;
      
      const [posts] = await db.query(postQuery);
      
      if (posts.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      post = posts[0];
      
      const commentsQuery = `SELECT c.*, u.username 
                            FROM comments c 
                            LEFT JOIN users u ON c.user_id = u.id 
                            WHERE c.post_id = '${id}' 
                            ORDER BY c.created_at DESC`;
      
      const [commentRows] = await db.query(commentsQuery);
      comments = commentRows;
    }
    
    res.json({ post, comments });
  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).json({ 
      message: 'Error fetching post details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const securityEnabled = await isSecurityEnabled();
    
    let comments;
    
    if (securityEnabled) {
      // Secure version - Use parameterized queries
      const [rows] = await db.query(
        'SELECT * FROM comments WHERE post_id = ?',
        [postId]
      );
      comments = rows;
    } else {
      // Insecure version - SQL injection vulnerability
      const query = `SELECT * FROM comments WHERE post_id = '${postId}'`;
      const [rows] = await db.query(query);
      comments = rows;
    }
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      message: 'Error fetching comments',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a new comment - FIXED: changed from '/add' to '/' to match client API calls
router.post('/', async (req, res) => {
  try {
    const { userId, postId, content } = req.body;
    
    // Log received data for debugging
    console.log('Comment data received:', { userId, postId, content });

    const securityEnabled = await isSecurityEnabled();

    if (securityEnabled) {
      // Secure version - Use parameterized queries and sanitize content for XSS
      const sanitizedContent = DOMPurify.sanitize(content);
      
      const [result] = await db.query(
        'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())',
        [userId, postId, sanitizedContent]
      );

      const [newComment] = await db.query(
        'SELECT * FROM comments WHERE id = ?', 
        [result.insertId]
      );

      res.status(201).json({
        id: result.insertId,
        message: 'Comment added successfully',
        content: sanitizedContent,
        created_at: newComment[0].created_at,
        user_id: userId,
        post_id: postId
      });
    } else {
      // Insecure version - Vulnerable to both SQL Injection and XSS
      // WARNING: This is intentionally vulnerable for demonstration purposes
      // Handle single quotes in content by escaping them for SQL
      const escapedContent = content.replace(/'/g, "''");
      
      const query = `INSERT INTO comments (user_id, post_id, content, created_at) 
                     VALUES ('${userId}', '${postId}', '${escapedContent}', NOW())`;

      // Log query for debugging XSS issues
      console.log('Executing insecure query:', query);

      try {
        const [result] = await db.query(query);
        
        // Fetch the newly created comment to get accurate timestamps
        const selectQuery = `SELECT * FROM comments WHERE id = ${result.insertId}`;
        const [newComment] = await db.query(selectQuery);
        
        res.status(201).json({
          id: result.insertId,
          message: 'Comment added successfully (INSECURE: XSS vulnerability present)',
          content: content, // Intentionally returning unsanitized content
          created_at: newComment[0].created_at,
          user_id: userId,
          post_id: postId
        });
      } catch (sqlError) {
        console.error('SQL error during comment insertion:', sqlError);
        return res.status(500).json({
          message: 'Error adding comment - SQL error',
          details: process.env.NODE_ENV === 'development' ? sqlError.message : undefined,
          query: process.env.NODE_ENV === 'development' ? query : undefined
        });
      }
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Error adding comment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;