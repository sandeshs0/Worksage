import React from "react";
import { escapeHTML, sanitizeInput, validateXSS } from "../utils/xssProtection";

/**
 * Secure Input Component with XSS Protection
 * Automatically sanitizes input and prevents XSS attacks
 */
export const SecureInput = ({
  value,
  onChange,
  sanitizationLevel = "strict",
  showValidation = false,
  ...props
}) => {
  const [validationResult, setValidationResult] = React.useState({
    isValid: true,
    threats: [],
  });

  const handleChange = (e) => {
    const rawValue = e.target.value;

    // Validate for XSS if requested
    if (showValidation) {
      const validation = validateXSS(rawValue);
      setValidationResult(validation);
    }

    // Sanitize based on level
    let sanitizedValue;
    switch (sanitizationLevel) {
      case "strict":
        sanitizedValue = sanitizeInput(rawValue);
        break;
      case "escape":
        sanitizedValue = escapeHTML(rawValue);
        break;
      case "none":
        sanitizedValue = rawValue;
        break;
      default:
        sanitizedValue = sanitizeInput(rawValue);
    }

    // Create new event with sanitized value
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitizedValue,
      },
    };

    onChange(sanitizedEvent);
  };

  return (
    <div>
      <input {...props} value={value} onChange={handleChange} />
      {showValidation && !validationResult.isValid && (
        <div className="text-red-500 text-sm mt-1">
          Security Warning: Potentially malicious content detected
          <ul className="list-disc list-inside">
            {validationResult.threats.map((threat, index) => (
              <li key={index}>{threat}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Secure Textarea Component with XSS Protection
 */
export const SecureTextarea = ({
  value,
  onChange,
  sanitizationLevel = "strict",
  showValidation = false,
  ...props
}) => {
  const [validationResult, setValidationResult] = React.useState({
    isValid: true,
    threats: [],
  });

  const handleChange = (e) => {
    const rawValue = e.target.value;

    // Validate for XSS if requested
    if (showValidation) {
      const validation = validateXSS(rawValue);
      setValidationResult(validation);
    }

    // Sanitize based on level
    let sanitizedValue;
    switch (sanitizationLevel) {
      case "strict":
        sanitizedValue = sanitizeInput(rawValue);
        break;
      case "escape":
        sanitizedValue = escapeHTML(rawValue);
        break;
      case "none":
        sanitizedValue = rawValue;
        break;
      default:
        sanitizedValue = sanitizeInput(rawValue);
    }

    // Create new event with sanitized value
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitizedValue,
      },
    };

    onChange(sanitizedEvent);
  };

  return (
    <div>
      <textarea {...props} value={value} onChange={handleChange} />
      {showValidation && !validationResult.isValid && (
        <div className="text-red-500 text-sm mt-1">
          Security Warning: Potentially malicious content detected
          <ul className="list-disc list-inside">
            {validationResult.threats.map((threat, index) => (
              <li key={index}>{threat}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Secure Form Component that sanitizes all form data on submit
 */
export const SecureForm = ({
  onSubmit,
  sanitizeOnSubmit = true,
  children,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();

    if (sanitizeOnSubmit) {
      // Get form data
      const formData = new FormData(e.target);
      const sanitizedData = {};

      // Sanitize all form fields
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          sanitizedData[key] = sanitizeInput(value);
        } else {
          sanitizedData[key] = value;
        }
      }

      // Create sanitized event
      const sanitizedEvent = {
        ...e,
        sanitizedData,
      };

      onSubmit(sanitizedEvent);
    } else {
      onSubmit(e);
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

/**
 * Hook for securing form state with automatic sanitization
 */
export const useSecureForm = (
  initialState = {},
  sanitizationLevel = "strict"
) => {
  const [formData, setFormData] = React.useState(initialState);
  const [validationErrors, setValidationErrors] = React.useState({});

  const updateField = (field, value, customSanitization = null) => {
    // Validate for XSS
    const validation = validateXSS(value);

    if (!validation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: validation.threats,
      }));
    } else {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    // Sanitize value
    let sanitizedValue;
    if (customSanitization) {
      sanitizedValue = customSanitization(value);
    } else {
      switch (sanitizationLevel) {
        case "strict":
          sanitizedValue = sanitizeInput(value);
          break;
        case "escape":
          sanitizedValue = escapeHTML(value);
          break;
        case "none":
          sanitizedValue = value;
          break;
        default:
          sanitizedValue = sanitizeInput(value);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const resetForm = () => {
    setFormData(initialState);
    setValidationErrors({});
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return {
    formData,
    validationErrors,
    hasValidationErrors,
    updateField,
    handleInputChange,
    resetForm,
    setFormData,
  };
};

export default {
  SecureInput,
  SecureTextarea,
  SecureForm,
  useSecureForm,
};
