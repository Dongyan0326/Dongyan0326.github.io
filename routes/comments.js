const express = require('express');
const router = express.Router();
const { db } = require('../database');

// 获取文章的评论
router.get('/post/:postId', (req, res) => {
  const postId = req.params.postId;
  
  db.all('SELECT * FROM comments WHERE post_id = ? ORDER BY date DESC', [postId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取评论失败' });
    }
    res.json(rows);
  });
});

// 添加评论
router.post('/post/:postId', (req, res) => {
  const postId = req.params.postId;
  const { name, content } = req.body;
  
  if (!name || !content) {
    return res.status(400).json({ error: '姓名和内容不能为空' });
  }
  
  // 检查文章是否存在
  db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '验证文章失败' });
    }
    
    if (!row) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    const date = new Date().toISOString();
    
    db.run(
      'INSERT INTO comments (post_id, name, content, date) VALUES (?, ?, ?, ?)',
      [postId, name, content, date],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: '添加评论失败' });
        }
        
        res.status(201).json({
          id: this.lastID,
          post_id: postId,
          name,
          content,
          date
        });
      }
    );
  });
});

// 删除评论
router.delete('/:id', (req, res) => {
  const commentId = req.params.id;
  
  db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '删除评论失败' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    res.json({ message: '评论已删除' });
  });
});

// 获取最近评论
router.get('/recent', (req, res) => {
  const limit = req.query.limit || 5;
  
  db.all(`
    SELECT 
      c.id, c.post_id, c.name, c.content, c.date,
      p.title as post_title
    FROM comments c
    JOIN posts p ON c.post_id = p.id
    ORDER BY c.date DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取最近评论失败' });
    }
    res.json(rows);
  });
});

module.exports = router; 