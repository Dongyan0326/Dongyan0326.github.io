/**
 * 简单的部署帮助脚本
 * 用于清理数据库和准备生产环境
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 配置
const config = {
  dbFile: './blog.db',
  uploadDir: './uploads',
  preserveFiles: ['.gitkeep']
};

// 显示帮助信息
function showHelp() {
  console.log(`
博客系统部署工具

用法: node deploy.js [命令]

命令:
  clean       - 删除数据库文件和上传的文件
  start       - 启动生产服务器
  help        - 显示帮助信息

示例:
  node deploy.js clean
  node deploy.js start
  `);
}

// 清理数据库和上传文件
function cleanData() {
  console.log('开始清理...');
  
  // 删除数据库文件
  if (fs.existsSync(config.dbFile)) {
    try {
      fs.unlinkSync(config.dbFile);
      console.log(`✅ 数据库文件 "${config.dbFile}" 已删除`);
    } catch (err) {
      console.error(`❌ 删除数据库文件失败: ${err.message}`);
    }
  } else {
    console.log(`ℹ️ 数据库文件 "${config.dbFile}" 不存在`);
  }
  
  // 清理上传目录
  if (fs.existsSync(config.uploadDir)) {
    try {
      const files = fs.readdirSync(config.uploadDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (config.preserveFiles.includes(file)) {
          continue; // 跳过需要保留的文件
        }
        
        const filePath = path.join(config.uploadDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      }
      
      console.log(`✅ 已从上传目录中删除 ${deletedCount} 个文件`);
    } catch (err) {
      console.error(`❌ 清理上传目录失败: ${err.message}`);
    }
  } else {
    console.log(`ℹ️ 上传目录 "${config.uploadDir}" 不存在`);
  }
  
  console.log('清理完成，系统将在启动时创建新的空数据库');
}

// 启动生产服务器
function startServer() {
  console.log('正在启动生产服务器...');
  
  // 设置生产环境变量
  process.env.NODE_ENV = 'production';
  
  // 检查是否安装了所有依赖
  if (!fs.existsSync('./node_modules')) {
    console.log('未检测到node_modules目录，正在安装依赖...');
    
    exec('npm install', (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ 安装依赖失败: ${err.message}`);
        return;
      }
      
      console.log('✅ 依赖安装完成');
      startNodeServer();
    });
  } else {
    startNodeServer();
  }
}

// 启动Node服务器
function startNodeServer() {
  console.log('正在启动Node.js服务器...');
  
  // 如果安装了PM2，使用PM2启动
  exec('npm list -g pm2', (err, stdout) => {
    if (stdout.includes('pm2@')) {
      console.log('检测到PM2，使用PM2启动服务器...');
      
      exec('pm2 start server.js --name "blog" -l logs/app.log', (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ PM2启动失败: ${err.message}`);
          console.log('尝试使用Node直接启动...');
          exec('node server.js', () => {});
          return;
        }
        
        console.log('✅ 服务器已使用PM2启动');
        console.log('👉 运行 "pm2 logs blog" 查看日志');
        console.log('👉 运行 "pm2 stop blog" 停止服务器');
      });
    } else {
      console.log('未检测到PM2，使用Node直接启动...');
      console.log('✅ 服务器已启动 (按Ctrl+C停止)');
      
      // 创建日志目录
      if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs');
      }
      
      // 启动服务器并将输出重定向到日志文件
      const out = fs.openSync('./logs/out.log', 'a');
      const err = fs.openSync('./logs/error.log', 'a');
      
      const child = require('child_process').spawn('node', ['server.js'], {
        detached: false,
        stdio: ['ignore', out, err]
      });
      
      child.unref();
    }
  });
}

// 主入口
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'clean':
      cleanData();
      break;
    case 'start':
      startServer();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// 执行主函数
main(); 