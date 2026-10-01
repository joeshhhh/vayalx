// VAYALX Standardized API Response Utilities

class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200) {
    const response = {
      success: true,
      message
    };
    if (data !== null && data !== undefined) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
