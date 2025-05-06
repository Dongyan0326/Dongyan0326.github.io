# 个人博客系统 - GitHub Pages版本

这是一个基于GitHub Pages的静态个人博客系统，是原动态博客系统的静态版本。

## 项目特点

- **纯静态**: 所有内容都是静态文件，无需服务器支持
- **响应式设计**: 适配各种屏幕尺寸，移动设备友好
- **GitHub Pages部署**: 免费托管，无需购买服务器
- **预渲染内容**: 所有内容预先从数据库导出为JSON文件

## 功能列表

- **文章展示**: 查看博客文章列表和详情
- **评论系统**: 查看已有评论（静态版本不支持添加新评论）
- **个人资料**: 展示个人信息和技能
- **访客统计**: 显示历史访问数据（静态预生成）

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **数据存储**: 静态JSON文件
- **部署平台**: GitHub Pages

## 静态版本说明

这个版本是从原始动态博客系统转换而来的静态版本，主要修改包括：

1. 将数据库内容导出为静态JSON文件
2. 用静态API客户端替换原动态API
3. 模拟写入操作（添加文章、评论等）

由于GitHub Pages不支持服务器端代码执行，所有需要服务器处理的功能（如添加文章、评论、上传文件等）在静态版本中只能模拟，不会实际修改数据。

## 本地开发

1. 克隆仓库:
   ```bash
   git clone https://github.com/<你的用户名>/<你的用户名>.github.io.git
   cd <你的用户名>.github.io
   ```

2. 使用任意HTTP服务器查看页面:
   ```bash
   # 如果安装了Python
   python -m http.server
   # 或使用Node.js的http-server
   npx http-server
   ```

3. 浏览器访问 `http://localhost:8000` 或 `http://localhost:8080` 查看页面

## 内容更新

如需更新内容，请参考[GitHub Pages部署指南](github-pages-deploy.md)中的"本地开发与更新"部分。

## 项目结构

```
/
├── index.html             # 主页面
├── assets/                # 前端资源
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   │   ├── api-static.js  # 静态API客户端
│   │   └── main.js        # 主要前端逻辑
│   └── images/            # 图片资源
├── data/                  # 静态JSON数据文件
│   ├── posts.json         # 文章数据
│   ├── comments.json      # 全部评论数据
│   ├── comments_1.json    # 特定文章的评论
│   ├── profile.json       # 个人资料
│   └── visitors.json      # 访客统计数据
└── uploads/               # 上传的文件（图片等）
```

## 许可

MIT License 