// VAYALX Community Controller (Phase 4)
const communityService = require('../services/community.service');
const { asyncHandler } = require('../middleware/error.middleware');

class CommunityController {
  createPost = asyncHandler(async (req, res) => {
    const post = await communityService.createPost(req.user._id, req.user.name, req.user.role, req.body);
    res.status(201).json({
      success: true,
      message: 'Discussion topic posted to Tamil Farmer Community',
      data: post
    });
  });

  getPosts = asyncHandler(async (req, res) => {
    const result = await communityService.getPosts(req.query);
    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination
    });
  });

  addComment = asyncHandler(async (req, res) => {
    const post = await communityService.addComment(req.params.id, req.user._id, req.user.name, req.body.comment);
    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: post
    });
  });

  toggleLike = asyncHandler(async (req, res) => {
    const result = await communityService.toggleLike(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: result
    });
  });

  deletePost = asyncHandler(async (req, res) => {
    const result = await communityService.deletePost(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      message: result.message
    });
  });
}

module.exports = new CommunityController();
