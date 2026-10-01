const schemesService = require('../services/schemes.service');

exports.getSchemes = async (req, res, next) => {
  try {
    const filters = {
      state: req.query.state,
      category: req.query.category,
      search: req.query.search
    };

    const result = await schemesService.getSchemes(filters);
    return res.status(200).json({
      success: true,
      data: result.data,
      source: result.source
    });
  } catch (error) {
    if (error.code === 'SCHEMES_PROVIDER_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        message: error.message,
        error: { code: error.code }
      });
    }
    next(error);
  }
};

exports.getSchemeById = async (req, res, next) => {
  try {
    const result = await schemesService.getSchemeById(req.params.id);
    return res.status(200).json({
      success: true,
      data: result.data,
      source: result.source
    });
  } catch (error) {
    if (error.code === 'SCHEME_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: { code: error.code }
      });
    }
    next(error);
  }
};
