// VAYALX Community Forum Routes (Phase 4)
const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public post reading
router.get('/', communityController.getPosts);

// Authenticated actions
router.post('/', requireAuth, communityController.createPost);
router.post('/:id/comments', requireAuth, communityController.addComment);
router.post('/:id/like', requireAuth, communityController.toggleLike);
router.delete('/:id', requireAuth, communityController.deletePost);

module.exports = router;
