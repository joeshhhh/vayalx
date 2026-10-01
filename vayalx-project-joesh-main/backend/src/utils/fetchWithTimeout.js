

/**
 * A wrapper around fetch that implements a timeout.
 * @param {string} resource - The URL to fetch.
 * @param {object} options - Fetch options (including timeout).
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout of ${timeout}ms exceeded`);
    }
    throw error;
  }
}

module.exports = fetchWithTimeout;
