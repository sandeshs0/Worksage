// Utility function to handle API errors consistently across auth pages
export const handleAuthError = (error, type = "general") => {
  console.error(`${type} error:`, error);

  // Default error structure
  const errorResponse = {
    general: null,
    field: null,
    toast: null,
  };

  // Handle different error structures from backend
  if (error.response?.data) {
    const errorData = error.response.data;

    // Handle express-validator errors (array format)
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const detailedErrors = errorData.errors
        .map((err) => {
          if (typeof err === "string") return err;
          return err.msg || err.message || "Validation error";
        })
        .join(". ");

      errorResponse.field = detailedErrors;
      errorResponse.general = errorData.message || "Validation failed";
      errorResponse.toast = "Please check the form for errors";
    }
    // Handle password requirements error
    else if (errorData.requirements) {
      const requirements = errorData.requirements.mustContain?.join(", ") || "";
      errorResponse.field = `Password requirements: ${requirements}`;
      errorResponse.general = errorData.message || "Password validation failed";
      errorResponse.toast = "Password does not meet security requirements";
    }
    // Handle single message error
    else if (errorData.message) {
      errorResponse.general = errorData.message;
      errorResponse.toast = errorData.message;
    }
  }
  // Handle errors without response structure
  else if (error.message) {
    errorResponse.general = error.message;
    errorResponse.toast = error.message;
  }
  // Fallback for unknown errors
  else {
    const fallbackMessage = `Failed to ${type}`;
    errorResponse.general = fallbackMessage;
    errorResponse.toast = fallbackMessage;
  }

  return errorResponse;
};

// Password strength checker that matches backend requirements
export const checkPasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    // Basic common password check (can be enhanced)
    notCommon: !["password", "12345678", "qwerty", "admin"].some((common) =>
      password.toLowerCase().includes(common)
    ),
  };

  const isValid = Object.values(requirements).every((req) => req === true);

  return {
    ...requirements,
    isValid,
    score: Object.values(requirements).filter((req) => req === true).length,
  };
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return "";

  return errors
    .map((error) => {
      if (typeof error === "string") return error;
      return error.msg || error.message || "Validation error";
    })
    .join(". ");
};
