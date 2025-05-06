const express = require('express');
const router = express.Router();
const { db } = require('../database');

// 获取所有文章
router.get('/', (req, res) => {
  db.all(`
    SELECT 
      p.id, p.title, p.content, p.date, p.author, p.views, p.image_url,
      COUNT(c.id) as comment_count
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.date DESC
  `, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取文章失败' });
    }
    res.json(rows);
  });
});

// 获取单个文章
router.get('/:id', (req, res) => {
  const postId = req.params.id;
  
  // 增加文章浏览量
  db.run('UPDATE posts SET views = views + 1 WHERE id = ?', [postId], function(err) {
    if (err) {
      console.error(err.message);
    }
  });
  
  // 获取文章内容和评论
  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取文章失败' });
    }
    
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 获取文章评论
    db.all('SELECT * FROM comments WHERE post_id = ? ORDER BY date DESC', [postId], (err, comments) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: '获取评论失败' });
      }
      
      post.comments = comments;
      res.json(post);
    });
  });
});

// 添加新文章
router.post('/', (req, res) => {
  const { title, content, author = '博主', image_url } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }
  
  const date = new Date().toISOString();
  
  db.run(
    'INSERT INTO posts (title, content, date, author, views, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, date, author, 0, image_url || null],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: '添加文章失败' });
      }
      
      res.status(201).json({
        id: this.lastID,
        title,
        content,
        date,
        author,
        views: 0,
        image_url
      });
    }
  );
});

// 删除文章
router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  
  db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '删除文章失败' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    res.json({ message: '文章已删除' });
  });
});

// 获取热门文章
router.get('/popular/top', (req, res) => {
  const limit = req.query.limit || 5;
  
  db.all(`
    SELECT 
      p.id, p.title, p.date, p.author, p.views,
      COUNT(c.id) as comment_count
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.views DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取热门文章失败' });
    }
    res.json(rows);
  });
});

module.exports = router; 