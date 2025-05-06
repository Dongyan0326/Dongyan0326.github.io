/**
 * 博客网站静态API
 * 用于GitHub Pages静态部署
 * 从JSON文件获取数据
 */
window.BlogAPI = (function() {
  // 基本路径
  const BASE_PATH = '/data';

  // 缓存对象，避免重复请求同一文件
  const cache = {};

  // 加载JSON文件
  async function loadJsonFile(filename) {
    if (cache[filename]) {
      return cache[filename];
    }

    try {
      const response = await fetch(`${BASE_PATH}/${filename}`);
      if (!response.ok) {
        throw new Error(`无法加载文件 ${filename}: ${response.status}`);
      }
      const data = await response.json();
      cache[filename] = data;
      return data;
    } catch (error) {
      console.error(`加载文件 ${filename} 失败:`, error);
      throw error;
    }
  }

  // 模拟延迟以便UI显示加载效果（可选）
  function delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 文章相关API
  const posts = {
    // 获取所有文章
    async getPosts() {
      await delay();
      return loadJsonFile('posts.json');
    },
    
    // 获取单篇文章
    async getPost(id) {
      await delay();
      const posts = await loadJsonFile('posts.json');
      const post = posts.find(p => p.id === parseInt(id));
      
      if (!post) {
        throw new Error('文章不存在');
      }
      
      // 获取文章评论
      try {
        post.comments = await loadJsonFile(`comments_${id}.json`);
      } catch (e) {
        post.comments = [];
      }
      
      return post;
    },
    
    // 获取热门文章
    async getPopularPosts(limit = 5) {
      await delay();
      const posts = await loadJsonFile('posts.json');
      return posts
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    },
    
    // 创建新文章 (仅模拟，GitHub Pages上不能真正创建)
    async createPost(postData) {
      await delay();
      alert('注意：在静态网站上无法创建真正的文章，这是一个模拟操作。');
      return {
        id: Date.now(),
        ...postData,
        date: new Date().toISOString(),
        views: 0,
        comment_count: 0
      };
    },
    
    // 删除文章 (仅模拟)
    async deletePost(id) {
      await delay();
      alert('注意：在静态网站上无法删除文章，这是一个模拟操作。');
      return { message: '模拟删除成功' };
    },
    
    // 添加评论 (仅模拟)
    async addComment(postId, commentData) {
      await delay();
      alert('注意：在静态网站上无法添加评论，这是一个模拟操作。');
      return {
        id: Date.now(),
        post_id: postId,
        date: new Date().toISOString(),
        ...commentData
      };
    }
  };

  // 评论相关API
  const comments = {
    // 获取文章评论
    async getPostComments(postId) {
      await delay();
      try {
        return await loadJsonFile(`comments_${postId}.json`);
      } catch (e) {
        return [];
      }
    },
    
    // 获取最近评论
    async getRecentComments(limit = 5) {
      await delay();
      const allComments = await loadJsonFile('comments.json');
      return allComments.slice(0, limit);
    },
    
    // 删除评论 (仅模拟)
    async deleteComment(id) {
      await delay();
      alert('注意：在静态网站上无法删除评论，这是一个模拟操作。');
      return { message: '模拟删除成功' };
    }
  };

  // 访客相关API (仅静态数据)
  const visitors = {
    // 记录访客 (仅模拟)
    async recordVisit() {
      // 不进行实际操作，只是为了保持API兼容性
      return { success: true };
    },
    
    // 获取访客统计
    async getStats() {
      await delay();
      const visitorData = await loadJsonFile('visitors.json');
      
      // 计算总访问量
      const totalVisits = visitorData.reduce((sum, day) => sum + day.count, 0);
      
      // 计算今日访问量 (静态数据，显示最后一天的数据)
      const todayVisits = visitorData.length > 0 ? 
        visitorData[visitorData.length - 1].count : 0;
      
      return {
        total: totalVisits,
        today: todayVisits
      };
    },
    
    // 获取访客趋势
    async getTrend() {
      await delay();
      return loadJsonFile('visitors.json');
    },
    
    // 获取最近访客 (仅返回虚拟数据)
    async getRecentVisitors(limit = 10) {
      await delay();
      return Array(limit).fill(null).map((_, i) => ({
        id: i + 1,
        ip: '192.168.1.' + i,
        visit_date: new Date(Date.now() - i * 3600000).toISOString(),
        user_agent: 'Mozilla/5.0 Static Demo',
        screen_size: '1920x1080',
        language: 'zh-CN'
      }));
    }
  };

  // 个人资料相关API
  const profile = {
    // 获取个人资料
    async getProfile() {
      await delay();
      return loadJsonFile('profile.json');
    },
    
    // 更新个人资料 (仅模拟)
    async updateProfile(profileData) {
      await delay();
      alert('注意：在静态网站上无法更新个人资料，这是一个模拟操作。');
      return { ...profileData };
    }
  };

  // 文件上传API (仅模拟)
  const uploads = {
    // 上传图片 (仅模拟)
    async uploadImage(file) {
      await delay(500); // 稍长的延迟以模拟上传过程
      alert('注意：在静态网站上无法上传文件，这是一个模拟操作。');
      
      // 返回一个示例URL
      return { url: '/assets/images/sample-upload.jpg' };
    }
  };

  // 公开API
  return {
    posts,
    comments,
    visitors,
    profile,
    uploads
  };
})(); 