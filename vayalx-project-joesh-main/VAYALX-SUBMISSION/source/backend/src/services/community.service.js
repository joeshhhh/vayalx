// VAYALX Community Forum Service (Phase 4)
const { CommunityPost } = require('../models');
const { createClientError } = require('../utils/error.util');

class CommunityService {
  /**
   * Create community post
   */
  async createPost(authorId, authorName, authorRole, data) {
    const { title, content, category = 'General Farming', images = [] } = data;

    if (!title || !title.trim()) {
      throw createClientError('Post title is required', 400);
    }
    if (!content || !content.trim()) {
      throw createClientError('Post content is required', 400);
    }

    const post = await CommunityPost.create({
      author: authorId,
      authorName: authorName || 'Farmer',
      authorRole: authorRole || 'farmer',
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      images: Array.isArray(images) ? images : [],
      status: 'active'
    });

    return post;
  }

  /**
   * Get paginated active posts
   */
  async getPosts({ category, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'active' };
    if (category) query.category = category;

    const [posts, total] = await Promise.all([
      CommunityPost.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      CommunityPost.countDocuments(query)
    ]);

    return {
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Add comment to post
   */
  async addComment(postId, userId, userName, commentText) {
    if (!commentText || !commentText.trim()) {
      throw createClientError('Comment text cannot be empty', 400);
    }

    const post = await CommunityPost.findById(postId);
    if (!post || post.status !== 'active') {
      throw createClientError('Post not found or unavailable', 404);
    }

    post.comments.push({
      user: userId,
      userName: userName || 'Farmer',
      comment: commentText.trim(),
      createdAt: new Date()
    });

    await post.save();
    return post;
  }

  /**
   * Toggle like on post
   */
  async toggleLike(postId, userId) {
    const post = await CommunityPost.findById(postId);
    if (!post || post.status !== 'active') {
      throw createClientError('Post not found', 404);
    }

    const alreadyLikedIndex = post.likes.findIndex(id => id.toString() === userId.toString());
    let liked = false;

    if (alreadyLikedIndex > -1) {
      post.likes.splice(alreadyLikedIndex, 1);
      liked = false;
    } else {
      post.likes.push(userId);
      liked = true;
    }

    await post.save();
    return { liked, totalLikes: post.likes.length };
  }

  /**
   * Delete post (author or admin)
   */
  async deletePost(postId, userId, userRole) {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      throw createClientError('Post not found', 404);
    }

    if (post.author.toString() !== userId.toString() && userRole !== 'admin') {
      throw createClientError('Forbidden: You can only delete your own posts', 403);
    }

    post.status = 'deleted';
    await post.save();
    return { success: true, message: 'Post deleted' };
  }
}

module.exports = new CommunityService();
