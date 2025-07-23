import DOMPurify from "dompurify";
import React from "react";

// XSS Protection Configuration
const XSS_CONFIG = {
  // Allowed tags for rich content
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "i",
    "b",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
    "a",
    "span",
    "div",
  ],

  // Allowed attributes
  ALLOWED_ATTRIBUTES: {
    a: ["href", "title"],
    img: ["src", "alt", "title", "width", "height"],
    span: ["class"],
    div: ["class"],
    code: ["class"],
    pre: ["class"],
  },

  // Strict configuration for untrusted content
  STRICT_CONFIG: {
    ALLOWED_TAGS: ["p", "br", "strong", "em"],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  },
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The HTML content to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  const config = {
    ALLOWED_TAGS: options.allowedTags || XSS_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: options.allowedAttributes || XSS_CONFIG.ALLOWED_ATTRIBUTES,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    FORBID_TAGS: [
      "script",
      "object",
      "embed",
      "iframe",
      "form",
      "input",
      "textarea",
      "select",
      "button",
    ],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
    ],
    ...options.config,
  };

  try {
    return DOMPurify.sanitize(dirty, config);
  } catch (error) {
    console.error("XSS Sanitization error:", error);
    return ""; // Return empty string on error for safety
  }
};

/**
 * Strict sanitization for user input (removes all HTML)
 * @param {string} input - The input to sanitize
 * @returns {string} - Plain text output
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  try {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  } catch (error) {
    console.error("Input sanitization error:", error);
    return "";
  }
};

/**
 * Sanitize content for rich text editors (more permissive)
 * @param {string} content - The rich content to sanitize
 * @returns {string} - Sanitized rich content
 */
export const sanitizeRichContent = (content) => {
  if (!content || typeof content !== "string") {
    return "";
  }

  const config = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "i",
      "b",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "a",
      "span",
      "div",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
    ],
    ALLOWED_ATTR: {
      a: ["href", "title", "target"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["class", "style"],
      div: ["class", "style"],
      p: ["class", "style"],
      table: ["class"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
  };

  try {
    return DOMPurify.sanitize(content, config);
  } catch (error) {
    console.error("Rich content sanitization error:", error);
    return "";
  }
};

/**
 * Sanitize text content for display (escapes HTML entities)
 * @param {string} text - The text to sanitize
 * @returns {string} - HTML-escaped text
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  const entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return text.replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

/**
 * Safe component for rendering sanitized HTML
 * Usage: <SafeHTML content={userContent} />
 */
export const SafeHTML = ({
  content,
  config = {},
  className = "",
  ...props
}) => {
  const sanitizedContent = sanitizeHTML(content, config);

  return React.createElement("div", {
    className: className,
    dangerouslySetInnerHTML: { __html: sanitizedContent },
    ...props,
  });
};

/**
 * Validate if content contains potential XSS
 * @param {string} content - Content to validate
 * @returns {object} - Validation result with isValid and threats
 */
export const validateXSS = (content) => {
  if (!content || typeof content !== "string") {
    return { isValid: true, threats: [] };
  }

  const xssPatterns = [
    {
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      threat: "Script injection",
    },
    {
      pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      threat: "Iframe injection",
    },
    { pattern: /javascript:/gi, threat: "JavaScript protocol" },
    { pattern: /vbscript:/gi, threat: "VBScript protocol" },
    { pattern: /on\w+\s*=/gi, threat: "Event handler attributes" },
    { pattern: /eval\s*\(/gi, threat: "Eval function" },
    { pattern: /expression\s*\(/gi, threat: "CSS expression" },
    {
      pattern: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      threat: "Object embedding",
    },
    {
      pattern: /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      threat: "Embed injection",
    },
  ];

  const threats = [];

  for (const { pattern, threat } of xssPatterns) {
    if (pattern.test(content)) {
      threats.push(threat);
    }
  }

  return {
    isValid: threats.length === 0,
    threats,
  };
};

/**
 * XSS protection hook for React components
 */
export const useXSSProtection = () => {
  const sanitize = (content, options = {}) => sanitizeHTML(content, options);
  const sanitizeUserInput = (input) => sanitizeInput(input);
  const escape = (text) => escapeHTML(text);
  const validate = (content) => validateXSS(content);

  return {
    sanitize,
    sanitizeInput: sanitizeUserInput,
    escape,
    validate,
  };
};

export default {
  sanitizeHTML,
  sanitizeInput,
  sanitizeRichContent,
  escapeHTML,
  SafeHTML,
  validateXSS,
  useXSSProtection,
};
