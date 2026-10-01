// VAYALX Farm Record Routes (Phase 4)
const express = require('express');
const router = express.Router();
const farmRecordController = require('../controllers/farmRecord.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth, requireRole('farmer', 'admin'));

router.post('/', farmRecordController.createRecord);
router.get('/my', farmRecordController.getMyRecords);
router.get('/:id', farmRecordController.getRecordById);
router.patch('/:id', farmRecordController.updateRecord);
router.delete('/:id', farmRecordController.deleteRecord);

module.exports = router;
