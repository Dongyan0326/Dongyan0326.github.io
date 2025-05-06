const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { format } = require('date-fns');
const db = require('./database');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 初始化数据库
db.init();

// 路由
app.use('/api/posts', require('./routes/posts'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/profile', require('./routes/profile'));

// 文件上传路由
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传文件' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 