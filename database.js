const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库路径
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/data', 'blog.db')  // 生产环境路径
  : path.join(__dirname, 'blog.db');

// 确保数据目录存在（针对生产环境）
if (process.env.NODE_ENV === 'production') {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('已连接到SQLite数据库');
  }
});

// 数据库初始化
function init() {
  // 启用外键约束
  db.run('PRAGMA foreign_keys = ON');
  
  // 创建文章表
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      author TEXT DEFAULT '博主',
      views INTEGER DEFAULT 0,
      image_url TEXT
    )
  `);
  
  // 创建评论表
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);
  
  // 创建访客表
  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      user_agent TEXT,
      screen_size TEXT,
      language TEXT,
      referrer TEXT,
      visit_date TEXT NOT NULL
    )
  `);
  
  // 创建个人资料表
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT,
      email TEXT,
      github TEXT,
      phone TEXT,
      about TEXT,
      photo_url TEXT
    )
  `);
  
  // 创建技能表
  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      profile_id INTEGER,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    )
  `);
  
  console.log('数据库表结构已初始化');
  
  // 检查个人资料是否存在，如果不存在则创建默认资料
  db.get('SELECT COUNT(*) as count FROM profile', (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
    
    // 如果不存在配置文件，创建默认配置
    if (row.count === 0) {
      createDefaultProfile();
    }
  });
}

// 创建默认个人资料
function createDefaultProfile() {
  db.run(
    'INSERT INTO profile (name, title, email, github, phone, about, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      'Dongyan', 
      '独立开发者', 
      '2303201737@qq.com', 
      'Dongyan0326', 
      '+86 180 1373 3907',
      '作为一名怀揣物理思维与AI热情的学习者，我始终相信科学的交叉融合将重塑未来。本科阶段的物理学训练赋予我严谨的逻辑推导能力与对自然规律的敏锐洞察力，而当下对Web开发、程序设计的探索，则让我掌握了将抽象概念转化为实际应用的桥梁。\n\n在学习HTML、CSS和JavaScript构建交互界面的过程中，我逐渐理解用户需求与技术实现间的平衡艺术；通过Python程序设计，我培养出结构化解决问题的思维方式，这些都为我的AI探索之路奠定了坚实基础。',
      '/assets/images/portrait.jpg'
    ],
    function(err) {
      if (err) {
        console.error('创建默认个人资料失败:', err.message);
        return;
      }
      
      const profileId = this.lastID;
      
      // 添加默认技能
      const skills = [
        'JavaScript', 'Python', 'HTML/CSS', 'React', 
        'Node.js', '数据库设计', '机器学习', 'Web开发'
      ];
      
      const stmt = db.prepare('INSERT INTO skills (name, profile_id) VALUES (?, ?)');
      skills.forEach(skill => {
        stmt.run(skill, profileId);
      });
      stmt.finalize();
      
      console.log('已创建默认个人资料和技能');
    }
  );
}

module.exports = {
  db,
  init
}; 