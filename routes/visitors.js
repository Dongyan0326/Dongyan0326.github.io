const express = require('express');
const router = express.Router();
const { db } = require('../database');

// 记录访客信息
router.post('/', (req, res) => {
  const { userAgent, screenSize, language, referrer } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const visitDate = new Date().toISOString();
  
  db.run(
    'INSERT INTO visitors (ip, user_agent, screen_size, language, referrer, visit_date) VALUES (?, ?, ?, ?, ?, ?)',
    [ip, userAgent, screenSize, language, referrer, visitDate],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: '记录访客信息失败' });
      }
      
      res.status(201).json({
        id: this.lastID,
        visit_date: visitDate
      });
    }
  );
});

// 获取访客统计
router.get('/stats', (req, res) => {
  // 获取总访问次数
  db.get('SELECT COUNT(*) as total FROM visitors', (err, totalRow) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取访客统计失败' });
    }
    
    // 获取今日访问次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISOString = today.toISOString();
    
    db.get('SELECT COUNT(*) as today FROM visitors WHERE visit_date >= ?', [todayISOString], (err, todayRow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: '获取今日访客统计失败' });
      }
      
      // 获取本月访问次数
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfMonthISOString = firstDayOfMonth.toISOString();
      
      db.get('SELECT COUNT(*) as month FROM visitors WHERE visit_date >= ?', [firstDayOfMonthISOString], (err, monthRow) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: '获取本月访客统计失败' });
        }
        
        res.json({
          total: totalRow.total,
          today: todayRow.today,
          month: monthRow.month
        });
      });
    });
  });
});

// 获取最近7天的访问趋势
router.get('/trend', (req, res) => {
  const now = new Date();
  const result = [];
  
  // 循环获取过去7天的访问数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const startDate = date.toISOString();
    
    date.setHours(23, 59, 59, 999);
    const endDate = date.toISOString();
    
    result.push({
      date: startDate.split('T')[0], // 只保留日期部分
      count: 0 // 默认值，后面会更新
    });
    
    // 查询数据库
    db.get('SELECT COUNT(*) as count FROM visitors WHERE visit_date >= ? AND visit_date <= ?', [startDate, endDate], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      
      const index = 6 - i;
      if (result[index]) {
        result[index].count = row.count;
      }
      
      // 当所有查询完成后返回结果
      if (i === 0) {
        res.json(result);
      }
    });
  }
});

// 获取最近的访客记录
router.get('/recent', (req, res) => {
  const limit = req.query.limit || 10;
  
  db.all('SELECT * FROM visitors ORDER BY visit_date DESC LIMIT ?', [limit], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取最近访客记录失败' });
    }
    
    // 简化IP地址以保护隐私
    const sanitizedRows = rows.map(row => {
      if (row.ip) {
        const ipParts = row.ip.split('.');
        if (ipParts.length === 4) {
          // 对于IPv4地址，隐藏最后一段
          row.ip = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.*`;
        }
      }
      return row;
    });
    
    res.json(sanitizedRows);
  });
});

module.exports = router; 