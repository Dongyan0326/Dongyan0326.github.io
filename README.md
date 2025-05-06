# 个人博客网站项目

这是一个使用Node.js、Express和SQLite构建的全功能个人博客系统。

## 功能特点

- 文章管理（发布、查看、删除）
- 评论系统
- 访客统计和分析
- 个人资料管理
- 响应式界面设计
- SQLite轻量级数据库（无需复杂配置）

## 技术栈

- **前端**: HTML, CSS, JavaScript (原生)
- **后端**: Node.js, Express
- **数据库**: SQLite3
- **文件上传**: Multer

## 快速开始

### 安装依赖

```bash
# 安装项目依赖
npm install
```

### 运行项目

```bash
# 开发模式运行
npm run dev

# 生产模式运行
npm start
```

服务器默认在 http://localhost:3000 上运行。

## 项目结构

```
├── server.js           # 服务器入口文件
├── database.js         # 数据库配置和初始化
├── index.html          # 主页面
├── routes/             # API路由
│   ├── posts.js        # 文章相关API
│   ├── comments.js     # 评论相关API
│   ├── visitors.js     # 访客统计API
│   └── profile.js      # 个人资料API
├── assets/             # 静态资源
│   ├── js/             # JavaScript文件
│   ├── css/            # 样式文件
│   └── images/         # 图片资源
├── uploads/            # 上传文件存储目录
└── blog.db             # SQLite数据库文件
```

## 部署指南

### 本地部署

1. 克隆仓库
   ```bash
   git clone <仓库URL>
   cd <项目目录>
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动服务器
   ```bash
   npm start
   ```

### 生产环境部署

#### 方法一：直接部署到VPS/云服务器

1. 在服务器上安装Node.js
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. 上传项目文件到服务器

3. 安装PM2进程管理器
   ```bash
   npm install -g pm2
   ```

4. 启动应用
   ```bash
   cd <项目目录>
   npm install
   pm2 start server.js --name "blog"
   ```

5. 设置开机自启
   ```bash
   pm2 startup
   pm2 save
   ```

6. 配置Nginx作为反向代理（可选）
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### 方法二：使用Docker部署

1. 创建Dockerfile
   ```dockerfile
   FROM node:16-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .

   EXPOSE 3000

   CMD ["node", "server.js"]
   ```

2. 构建和运行Docker容器
   ```bash
   docker build -t blog-app .
   docker run -d -p 3000:3000 -v blog-data:/app/data --name blog blog-app
   ```

## 数据库说明

SQLite数据库文件位于项目根目录的`blog.db`。在生产环境中，数据库文件会存储在`/data/blog.db`，确保容器或服务器上该目录存在并可写入。

数据库包含以下表：
- `posts`: 存储文章信息
- `comments`: 存储评论信息
- `visitors`: 存储访客记录
- `profile`: 存储个人资料
- `skills`: 存储技能列表

如需备份数据库，只需复制`blog.db`文件即可。

## API文档

### 文章 API

- `GET /api/posts` - 获取所有文章
- `GET /api/posts/:id` - 获取单个文章及其评论
- `POST /api/posts` - 创建新文章
- `DELETE /api/posts/:id` - 删除文章
- `GET /api/posts/popular/top` - 获取热门文章

### 评论 API

- `GET /api/comments/post/:postId` - 获取文章评论
- `POST /api/comments/post/:postId` - 添加评论
- `DELETE /api/comments/:id` - 删除评论
- `GET /api/comments/recent` - 获取最近评论

### 访客 API

- `POST /api/visitors` - 记录访客信息
- `GET /api/visitors/stats` - 获取访客统计
- `GET /api/visitors/trend` - 获取访问趋势
- `GET /api/visitors/recent` - 获取最近访客

### 个人资料 API

- `GET /api/profile` - 获取个人资料
- `PUT /api/profile` - 更新个人资料

### 上传 API

- `POST /api/upload` - 上传图片 