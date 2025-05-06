const express = require('express');
const router = express.Router();
const { db } = require('../database');

// 获取个人资料（包括技能）
router.get('/', (req, res) => {
  db.get('SELECT * FROM profile LIMIT 1', (err, profile) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取个人资料失败' });
    }
    
    if (!profile) {
      return res.status(404).json({ error: '个人资料不存在' });
    }
    
    // 获取技能列表
    db.all('SELECT id, name FROM skills WHERE profile_id = ?', [profile.id], (err, skills) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: '获取技能列表失败' });
      }
      
      profile.skills = skills;
      res.json(profile);
    });
  });
});

// 更新个人资料
router.put('/', (req, res) => {
  const { name, title, email, github, phone, about, photo_url, skills } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '姓名不能为空' });
  }
  
  // 获取现有个人资料ID
  db.get('SELECT id FROM profile LIMIT 1', (err, profile) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取个人资料失败' });
    }
    
    const profileId = profile ? profile.id : null;
    
    if (!profileId) {
      return res.status(404).json({ error: '个人资料不存在' });
    }
    
    // 更新个人资料
    db.run(
      'UPDATE profile SET name = ?, title = ?, email = ?, github = ?, phone = ?, about = ?, photo_url = ? WHERE id = ?',
      [name, title, email, github, phone, about, photo_url, profileId],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: '更新个人资料失败' });
        }
        
        // 如果提供了技能数组，更新技能
        if (Array.isArray(skills)) {
          // 删除现有技能
          db.run('DELETE FROM skills WHERE profile_id = ?', [profileId], function(err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ error: '更新技能失败' });
            }
            
            // 添加新的技能
            const stmt = db.prepare('INSERT INTO skills (name, profile_id) VALUES (?, ?)');
            skills.forEach(skill => {
              stmt.run(skill, profileId);
            });
            stmt.finalize();
            
            // 返回更新后的完整个人资料
            getUpdatedProfile(profileId, res);
          });
        } else {
          // 直接返回更新后的个人资料
          getUpdatedProfile(profileId, res);
        }
      }
    );
  });
});

// 获取更新后的个人资料
function getUpdatedProfile(profileId, res) {
  db.get('SELECT * FROM profile WHERE id = ?', [profileId], (err, profile) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: '获取更新后的个人资料失败' });
    }
    
    db.all('SELECT id, name FROM skills WHERE profile_id = ?', [profileId], (err, skills) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: '获取技能列表失败' });
      }
      
      profile.skills = skills;
      res.json(profile);
    });
  });
}

module.exports = router; 