// VAYALX Notification Routes (Phase 4)
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
