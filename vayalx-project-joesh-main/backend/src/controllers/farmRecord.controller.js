// VAYALX Farm Record Controller (Phase 4)
const farmRecordService = require('../services/farmRecord.service');
const { asyncHandler } = require('../middleware/error.middleware');

class FarmRecordController {
  createRecord = asyncHandler(async (req, res) => {
    const record = await farmRecordService.createRecord(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Farm activity recorded successfully in ledger',
      data: record
    });
  });

  getMyRecords = asyncHandler(async (req, res) => {
    const result = await farmRecordService.getFarmerRecords(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination
    });
  });

  getRecordById = asyncHandler(async (req, res) => {
    const record = await farmRecordService.getRecordById(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: record
    });
  });

  updateRecord = asyncHandler(async (req, res) => {
    const record = await farmRecordService.updateRecord(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Farm record updated successfully',
      data: record
    });
  });

  deleteRecord = asyncHandler(async (req, res) => {
    const result = await farmRecordService.deleteRecord(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id }
    });
  });
}

module.exports = new FarmRecordController();
