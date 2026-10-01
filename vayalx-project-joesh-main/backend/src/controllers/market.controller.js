const marketService = require('../services/market.service');

exports.getPrices = async (req, res, next) => {
  try {
    const filters = {
      commodity: req.query.commodity,
      state: req.query.state,
      district: req.query.district,
      market: req.query.market,
      date: req.query.date,
      limit: req.query.limit
    };

    const result = await marketService.getMarketPrices(filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      source: result.source
    });
  } catch (error) {
    if (error.code === 'MARKET_PROVIDER_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        message: error.message,
        error: { code: error.code }
      });
    }
    next(error);
  }
};
