/**
 * 博客网站主脚本
 * 用于连接前端UI与后端API
 */
document.addEventListener('DOMContentLoaded', function() {
  // 确保API脚本已加载
  if (!window.BlogAPI) {
    console.error('API脚本未加载！');
    return;
  }

  // 全局状态
  const state = {
    posts: [],
    currentPost: null,
    profile: null,
    isLoading: false,
    searchQuery: ''
  };

  // DOM元素引用
  const elements = {
    blogSection: document.querySelector('.blog-section'),
    blogForm: document.getElementById('blog-form'),
    showFormBtn: document.getElementById('show-form-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    postForm: document.getElementById('new-post-form'),
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    searchResults: document.getElementById('search-results'),
    profileSection: document.querySelector('.profile-section'),
    editProfileBtn: document.getElementById('edit-profile-btn'),
    articleDetails: document.getElementById('article-details'),
    backToListBtn: document.getElementById('back-to-list'),
  };

  // 初始化函数
  function init() {
    // 加载数据
    loadProfile();
    loadPosts();
    recordVisit();

    // 设置事件监听器
    setupEventListeners();
  }

  // 设置事件监听器
  function setupEventListeners() {
    // 表单显示/隐藏
    if (elements.showFormBtn) {
      elements.showFormBtn.addEventListener('click', togglePostForm);
    }

    if (elements.cancelBtn) {
      elements.cancelBtn.addEventListener('click', hidePostForm);
    }

    // 新文章表单提交
    if (elements.postForm) {
      elements.postForm.addEventListener('submit', handlePostSubmit);
    }

    // 返回文章列表
    if (elements.backToListBtn) {
      elements.backToListBtn.addEventListener('click', hideArticleDetails);
    }

    // 搜索功能
    if (elements.searchInput && elements.searchButton) {
      elements.searchButton.addEventListener('click', handleSearch);
      elements.searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
    }

    // 编辑个人资料
    if (elements.editProfileBtn) {
      elements.editProfileBtn.addEventListener('click', showProfileEditor);
    }

    // 点击事件代理（用于文章操作）
    document.addEventListener('click', handleDocumentClick);
  }

  // 记录访客信息
  async function recordVisit() {
    try {
      await BlogAPI.visitors.recordVisit();
      console.log('访客记录成功');
    } catch (error) {
      console.error('访客记录失败:', error);
    }
  }

  // 加载文章列表
  async function loadPosts() {
    try {
      setLoading(true);
      state.posts = await BlogAPI.posts.getPosts();
      renderPosts(state.posts);
    } catch (error) {
      console.error('加载文章失败:', error);
      showError('加载文章失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  }

  // 渲染文章列表
  function renderPosts(posts) {
    if (!elements.blogSection) return;
    
    // 清空现有内容
    elements.blogSection.innerHTML = '';
    
    if (posts.length === 0) {
      elements.blogSection.innerHTML = '<div class="no-posts">暂无文章，点击"添加文章"创建第一篇博客</div>';
      return;
    }
    
    // 添加文章
    posts.forEach(post => {
      const postElement = createPostElement(post);
      elements.blogSection.appendChild(postElement);
    });
  }

  // 创建文章元素
  function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'blog-post';
    postElement.dataset.postId = post.id;
    
    // 格式化日期
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // 创建摘要（取前150个字符）
    const summary = post.content.length > 150 
      ? post.content.substring(0, 150) + '...' 
      : post.content;
    
    // 设置HTML内容
    postElement.innerHTML = `
      <h2>${post.title}</h2>
      <div class="post-date">${formattedDate}</div>
      ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" class="post-image">` : ''}
      <div class="post-content">
        <p>${summary}</p>
      </div>
      <div class="post-actions">
        <div class="post-buttons">
          <a href="#" class="read-more" data-post-id="${post.id}">阅读更多</a>
          <a class="delete-post" data-post-id="${post.id}">🗑️ 删除</a>
        </div>
        <div class="comments-toggle" data-post-id="${post.id}">💬 评论 (${post.comment_count || 0})</div>
      </div>
      <div class="comments-section">
        <div class="comments-list"></div>
        <div class="add-comment-form">
          <input type="text" class="comment-input" placeholder="添加评论...">
          <button class="comment-submit" data-post-id="${post.id}">发送</button>
        </div>
      </div>
    `;
    
    return postElement;
  }

  // 处理文档点击事件（事件代理）
  function handleDocumentClick(e) {
    // 阅读更多按钮
    if (e.target.classList.contains('read-more') || e.target.closest('.read-more')) {
      e.preventDefault();
      const link = e.target.classList.contains('read-more') ? e.target : e.target.closest('.read-more');
      const postId = link.dataset.postId;
      if (postId) {
        showArticleDetails(postId);
      }
    }
    
    // 删除文章按钮
    else if (e.target.classList.contains('delete-post') || e.target.closest('.delete-post')) {
      const link = e.target.classList.contains('delete-post') ? e.target : e.target.closest('.delete-post');
      const postId = link.dataset.postId;
      if (postId) {
        confirmDeletePost(postId);
      }
    }
    
    // 评论切换按钮
    else if (e.target.classList.contains('comments-toggle') || e.target.closest('.comments-toggle')) {
      const toggle = e.target.classList.contains('comments-toggle') ? e.target : e.target.closest('.comments-toggle');
      const postId = toggle.dataset.postId;
      if (postId) {
        toggleComments(postId);
      }
    }
    
    // 提交评论按钮
    else if (e.target.classList.contains('comment-submit')) {
      const postId = e.target.dataset.postId;
      if (postId) {
        const commentSection = e.target.closest('.comments-section');
        const input = commentSection.querySelector('.comment-input');
        if (input && input.value.trim()) {
          submitComment(postId, input.value.trim());
          input.value = '';
        }
      }
    }
    
    // 删除评论按钮
    else if (e.target.classList.contains('comment-delete')) {
      const commentElement = e.target.closest('.comment');
      if (commentElement) {
        const commentId = commentElement.dataset.commentId;
        if (commentId) {
          confirmDeleteComment(commentId);
        }
      }
    }
  }

  // 显示文章详情
  async function showArticleDetails(postId) {
    try {
      setLoading(true);
      
      // 获取文章详情
      const post = await BlogAPI.posts.getPost(postId);
      if (!post) {
        showError('无法加载文章');
        return;
      }
      
      state.currentPost = post;
      
      // 更新文章详情视图
      if (elements.articleDetails) {
        // 设置标题和日期
        const titleElement = elements.articleDetails.querySelector('.article-title');
        const dateElement = elements.articleDetails.querySelector('.article-date');
        const contentElement = elements.articleDetails.querySelector('.article-content');
        
        if (titleElement) titleElement.textContent = post.title;
        
        if (dateElement) {
          const date = new Date(post.date);
          dateElement.textContent = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        
        if (contentElement) {
          // 设置内容（包括可能的图片）
          contentElement.innerHTML = '';
          
          // 添加图片（如果有）
          if (post.image_url) {
            const img = document.createElement('img');
            img.src = post.image_url;
            img.alt = post.title;
            img.className = 'post-image';
            contentElement.appendChild(img);
          }
          
          // 添加文章内容
          contentElement.innerHTML += post.content;
        }
        
        // 显示文章详情
        elements.articleDetails.classList.add('active');
        
        // 防止页面滚动
        document.body.style.overflow = 'hidden';
      }
    } catch (error) {
      console.error('获取文章详情失败:', error);
      showError('获取文章详情失败');
    } finally {
      setLoading(false);
    }
  }

  // 隐藏文章详情
  function hideArticleDetails() {
    if (elements.articleDetails) {
      elements.articleDetails.classList.remove('active');
      
      // 恢复页面滚动
      document.body.style.overflow = '';
      
      // 清除当前文章
      state.currentPost = null;
    }
  }

  // 确认删除文章
  function confirmDeletePost(postId) {
    if (confirm('确定要删除这篇文章吗？')) {
      deletePost(postId);
    }
  }

  // 删除文章
  async function deletePost(postId) {
    try {
      setLoading(true);
      await BlogAPI.posts.deletePost(postId);
      
      // 从状态中移除文章
      state.posts = state.posts.filter(post => post.id !== parseInt(postId));
      
      // 重新渲染文章列表
      renderPosts(state.posts);
      
      showMessage('文章已删除');
    } catch (error) {
      console.error('删除文章失败:', error);
      showError('删除文章失败');
    } finally {
      setLoading(false);
    }
  }

  // 切换评论显示/隐藏
  async function toggleComments(postId) {
    const postElement = document.querySelector(`.blog-post[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    const commentsList = postElement.querySelector('.comments-list');
    if (!commentsList) return;
    
    // 如果评论列表已有内容且是可见的，只需切换显示状态
    if (commentsList.innerHTML.trim() && commentsList.classList.contains('active')) {
      commentsList.classList.remove('active');
      return;
    }
    
    // 如果评论列表为空或不可见，加载评论并显示
    try {
      setLoading(true);
      
      // 获取评论
      const comments = await BlogAPI.comments.getPostComments(postId);
      
      // 清空并填充评论列表
      commentsList.innerHTML = '';
      
      if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">暂无评论</div>';
      } else {
        comments.forEach(comment => {
          const commentElement = createCommentElement(comment);
          commentsList.appendChild(commentElement);
        });
      }
      
      // 显示评论列表
      commentsList.classList.add('active');
    } catch (error) {
      console.error('获取评论失败:', error);
      showError('获取评论失败');
    } finally {
      setLoading(false);
    }
  }

  // 创建评论元素
  function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.commentId = comment.id;
    
    // 格式化日期
    const date = new Date(comment.date);
    const formattedDate = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // 设置HTML内容
    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">${comment.name}</div>
        <div class="comment-date">${formattedDate}</div>
      </div>
      <div class="comment-content">${comment.content}</div>
      <div class="comment-actions">
        <div class="comment-delete">删除</div>
      </div>
    `;
    
    return commentElement;
  }

  // 提交评论
  async function submitComment(postId, content) {
    try {
      setLoading(true);
      
      // 创建评论数据
      const commentData = {
        name: '访客', // 默认名称
        content: content
      };
      
      // 发送评论
      const newComment = await BlogAPI.posts.addComment(postId, commentData);
      
      // 更新评论计数
      updateCommentCount(postId);
      
      // 添加新评论到列表
      const postElement = document.querySelector(`.blog-post[data-post-id="${postId}"]`);
      if (postElement) {
        const commentsList = postElement.querySelector('.comments-list');
        if (commentsList) {
          // 确保评论列表是可见的
          commentsList.classList.add('active');
          
          // 移除"暂无评论"提示
          const noComments = commentsList.querySelector('.no-comments');
          if (noComments) {
            noComments.remove();
          }
          
          // 添加新评论
          const commentElement = createCommentElement(newComment);
          commentsList.insertBefore(commentElement, commentsList.firstChild);
        }
      }
      
      showMessage('评论已添加');
    } catch (error) {
      console.error('添加评论失败:', error);
      showError('添加评论失败');
    } finally {
      setLoading(false);
    }
  }

  // 更新评论计数
  function updateCommentCount(postId) {
    const post = state.posts.find(p => p.id === parseInt(postId));
    if (post) {
      post.comment_count = (post.comment_count || 0) + 1;
      
      // 更新DOM
      const commentToggle = document.querySelector(`.comments-toggle[data-post-id="${postId}"]`);
      if (commentToggle) {
        commentToggle.textContent = `💬 评论 (${post.comment_count})`;
      }
    }
  }

  // 确认删除评论
  function confirmDeleteComment(commentId) {
    if (confirm('确定要删除这条评论吗？')) {
      deleteComment(commentId);
    }
  }

  // 删除评论
  async function deleteComment(commentId) {
    try {
      setLoading(true);
      await BlogAPI.comments.deleteComment(commentId);
      
      // 从DOM中移除评论
      const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
      if (commentElement) {
        const postElement = commentElement.closest('.blog-post');
        if (postElement) {
          const postId = postElement.dataset.postId;
          
          // 更新评论计数（减1）
          const post = state.posts.find(p => p.id === parseInt(postId));
          if (post && post.comment_count > 0) {
            post.comment_count--;
            
            // 更新DOM
            const commentToggle = postElement.querySelector('.comments-toggle');
            if (commentToggle) {
              commentToggle.textContent = `💬 评论 (${post.comment_count})`;
            }
          }
        }
        
        commentElement.remove();
        
        // 如果没有评论了，显示"暂无评论"
        const commentsList = commentElement.closest('.comments-list');
        if (commentsList && !commentsList.querySelector('.comment')) {
          commentsList.innerHTML = '<div class="no-comments">暂无评论</div>';
        }
      }
      
      showMessage('评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      showError('删除评论失败');
    } finally {
      setLoading(false);
    }
  }
}); 