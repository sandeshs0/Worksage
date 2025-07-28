/**
 * Decode HTML entities in a string
 * @param {string} str - The string to decode
 * @returns {string} - The decoded string
 */
function decodeHTMLEntities(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#47;/g, '/');
}

module.exports = {
  decodeHTMLEntities
};
