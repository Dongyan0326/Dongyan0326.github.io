/**
 * 博客网站前端API
 * 用于与后端服务器通信
 */
window.BlogAPI = (function() {
  // API基本URL，根据环境自动选择
  const BASE_URL = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

  // 通用请求函数
  async function request(endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 文章相关API
  const posts = {
    // 获取所有文章
    async getPosts() {
      return await request('/posts');
    },
    
    // 获取单篇文章
    async getPost(id) {
      return await request(`/posts/${id}`);
    },
    
    // 获取热门文章
    async getPopularPosts(limit = 5) {
      return await request(`/posts/popular/top?limit=${limit}`);
    },
    
    // 创建新文章
    async createPost(postData) {
      return await request('/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
    },
    
    // 删除文章
    async deletePost(id) {
      return await request(`/posts/${id}`, {
        method: 'DELETE'
      });
    },
    
    // 添加评论
    async addComment(postId, commentData) {
      return await request(`/comments/post/${postId}`, {
        method: 'POST',
        body: JSON.stringify(commentData)
      });
    }
  };

  // 评论相关API
  const comments = {
    // 获取文章评论
    async getPostComments(postId) {
      return await request(`/comments/post/${postId}`);
    },
    
    // 获取最近评论
    async getRecentComments(limit = 5) {
      return await request(`/comments/recent?limit=${limit}`);
    },
    
    // 删除评论
    async deleteComment(id) {
      return await request(`/comments/${id}`, {
        method: 'DELETE'
      });
    }
  };

  // 访客相关API
  const visitors = {
    // 记录访客
    async recordVisit() {
      const userAgent = navigator.userAgent;
      const screenSize = `${window.screen.width}x${window.screen.height}`;
      const language = navigator.language || navigator.userLanguage;
      const referrer = document.referrer;
      
      return await request('/visitors', {
        method: 'POST',
        body: JSON.stringify({
          userAgent,
          screenSize,
          language,
          referrer
        })
      });
    },
    
    // 获取访客统计
    async getStats() {
      return await request('/visitors/stats');
    },
    
    // 获取访客趋势
    async getTrend() {
      return await request('/visitors/trend');
    },
    
    // 获取最近访客
    async getRecentVisitors(limit = 10) {
      return await request(`/visitors/recent?limit=${limit}`);
    }
  };

  // 个人资料相关API
  const profile = {
    // 获取个人资料
    async getProfile() {
      return await request('/profile');
    },
    
    // 更新个人资料
    async updateProfile(profileData) {
      return await request('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  };

  // 文件上传API
  const uploads = {
    // 上传图片
    async uploadImage(file) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const url = `${BASE_URL}/upload`;
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`上传失败: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('图片上传错误:', error);
        throw error;
      }
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