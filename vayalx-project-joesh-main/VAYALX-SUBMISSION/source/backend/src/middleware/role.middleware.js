// VAYALX Role-Based Access Control & Ownership Middleware (Phase 3)
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// Role Authorization Middleware Factory
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before role verification.', 401));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`[Access Denied] User '${req.user._id}' with role '${userRole}' attempted to access endpoint restricted to [${allowedRoles.join(', ')}]`);
      return next(new AppError(`Access forbidden. Your account role (${userRole}) is not authorized for this resource.`, 403));
    }

    next();
  };
}

// Resource Ownership Verification Middleware Factory
function checkResourceOwnership(modelGetter, ownerField = 'user', idParam = 'id') {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    // Admins bypass ownership checks
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[idParam];
    if (!resourceId) {
      return next(new AppError(`Missing required resource parameter '${idParam}'.`, 400));
    }

    const Model = typeof modelGetter === 'function' ? modelGetter() : modelGetter;
    const resource = await Model.findById(resourceId);

    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    const resourceOwnerId = resource[ownerField] ? resource[ownerField].toString() : null;
    const currentUserId = req.user._id.toString();

    if (!resourceOwnerId || resourceOwnerId !== currentUserId) {
      logger.warn(`[Ownership Violation] User '${currentUserId}' attempted to mutate resource '${resourceId}' owned by '${resourceOwnerId}'`);
      return next(new AppError('Forbidden. You do not have ownership permission to modify or delete this resource.', 403));
    }

    // Attach verified resource to request for downstream controller efficiency
    req.verifiedResource = resource;
    next();
  });
}

module.exports = {
  requireRole,
  checkResourceOwnership
};
