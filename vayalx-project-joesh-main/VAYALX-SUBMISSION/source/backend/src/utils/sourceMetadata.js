/**
 * VAYALX - Source Metadata Helper
 */

function generateSourceMetadata(provider, mode, isCached, additionalMeta = {}) {
  return {
    provider,
    mode,
    cached: isCached,
    fetchedAt: new Date().toISOString(),
    ...additionalMeta
  };
}

module.exports = { generateSourceMetadata };
