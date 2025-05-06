# GitHub Pages部署指南

这个指南将帮助你将个人博客系统部署到GitHub Pages上。由于GitHub Pages只支持静态内容，我们需要将动态功能转换为静态展示。

## 准备工作

1. 确保你已经在本地运行过博客系统并添加了内容
2. 安装了Node.js环境

## 部署步骤

### 1. 导出数据

首先，需要将数据库内容导出为静态JSON文件：

```bash
# 运行导出脚本
node export-data.js
```

这将创建一个`data`目录，包含所有必要的JSON文件。

### 2. 准备GitHub仓库

1. 在GitHub上创建一个新的仓库，命名为`<你的用户名>.github.io`
2. 克隆仓库到本地：
   ```bash
   git clone https://github.com/<你的用户名>/<你的用户名>.github.io.git
   ```

### 3. 准备静态文件

将以下文件和目录复制到你的GitHub Pages仓库中：

```
index.html
assets/
data/
uploads/
```

### 4. 提交并推送

```bash
git add .
git commit -m "Initial commit for blog"
git push origin main
```

### 5. 配置GitHub Pages

1. 在GitHub仓库页面，点击"Settings"
2. 向下滚动到"GitHub Pages"部分
3. 在"Source"下拉菜单中选择"main"分支
4. 点击"Save"

几分钟后，你的博客将在`https://<你的用户名>.github.io`上线。

## 注意事项

### 功能限制

由于GitHub Pages只支持静态文件，以下功能在线上环境中将不可用：

1. 创建/编辑/删除文章
2. 添加/删除评论
3. 上传文件
4. 记录实时访客数据

这些功能将通过静态API模拟，但实际上不会修改任何数据。

### 本地开发与更新

当你想更新博客内容时，流程如下：

1. 在本地使用完整的后端系统添加/编辑内容
2. 重新运行导出脚本：`node export-data.js`
3. 将更新后的`data`目录复制到GitHub Pages仓库
4. 提交并推送更改

## 高级选项

### 自定义域名

如果你想使用自己的域名而不是`<你的用户名>.github.io`：

1. 在DNS提供商处添加一个CNAME记录，指向`<你的用户名>.github.io`
2. 在仓库根目录创建一个名为`CNAME`的文件，内容为你的域名
3. 提交并推送此文件

GitHub将自动为你的自定义域名配置HTTPS。

### 使用Jekyll主题

GitHub Pages原生支持Jekyll静态站点生成器。如果你想使用Jekyll主题，可以参考GitHub的Jekyll文档：

[GitHub Pages Jekyll文档](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll)

## 故障排除

### 页面无法加载

如果你的页面无法正确加载：

1. 检查浏览器控制台是否有错误
2. 确认所有路径都是相对于根目录的（以`/`开头）
3. 确保`data`目录中包含所有必要的JSON文件

### 图片无法显示

如果上传的图片无法显示：

1. 确保`uploads`目录及其内容已复制到GitHub仓库
2. 检查图片路径是否正确（应为`/uploads/...`） 