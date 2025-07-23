import React from 'react';
import { sanitizeInput, validateXSS } from '../utils/xssProtection';

/**
 * Higher Order Component for XSS Protection
 * Wraps existing components with automatic input sanitization
 */
export const withXSSProtection = (WrappedComponent, options = {}) => {
  const {
    sanitizationLevel = 'strict',
    enableValidation = false,
    logAttempts = false
  } = options;

  return function XSSProtectedComponent(props) {
    const [securityWarnings, setSecurityWarnings] = React.useState([]);

    // Function to sanitize and validate input
    const sanitizeAndValidate = (value, fieldName) => {
      if (typeof value !== 'string') return value;

      // Validate for XSS
      const validation = validateXSS(value);
      
      if (!validation.isValid) {
        const warning = {
          field: fieldName,
          threats: validation.threats,
          timestamp: new Date(),
          originalValue: value.substring(0, 50)
        };

        if (enableValidation) {
          setSecurityWarnings(prev => [...prev, warning]);
        }

        if (logAttempts) {
          console.warn('XSS attempt detected in field:', fieldName, validation.threats);
          
          // Send to backend logging if needed
          fetch('/api/security/log-xss-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              field: fieldName,
              threats: validation.threats,
              userAgent: navigator.userAgent,
              url: window.location.href,
              timestamp: new Date()
            })
          }).catch(err => console.error('Failed to log XSS attempt:', err));
        }
      }

      // Sanitize the input
      return sanitizeInput(value);
    };

    // Intercept and sanitize props that contain input handlers
    const securePropOverrides = {};

    // Handle onChange events
    if (props.onChange) {
      securePropOverrides.onChange = (e) => {
        const sanitizedValue = sanitizeAndValidate(e.target.value, e.target.name || 'unknown');
        const secureEvent = {
          ...e,
          target: {
            ...e.target,
            value: sanitizedValue
          }
        };
        props.onChange(secureEvent);
      };
    }

    // Handle onSubmit events
    if (props.onSubmit) {
      securePropOverrides.onSubmit = (e) => {
        e.preventDefault();
        
        // Sanitize form data
        const formData = new FormData(e.target);
        const sanitizedData = {};
        
        for (const [key, value] of formData.entries()) {
          sanitizedData[key] = sanitizeAndValidate(value, key);
        }
        
        const secureEvent = {
          ...e,
          sanitizedData,
          preventDefault: () => {}, // Already prevented
        };
        
        props.onSubmit(secureEvent);
      };
    }

    // Handle direct value props for controlled components
    if (props.value && typeof props.value === 'string') {
      securePropOverrides.value = sanitizeAndValidate(props.value, 'value');
    }

    // Handle defaultValue props
    if (props.defaultValue && typeof props.defaultValue === 'string') {
      securePropOverrides.defaultValue = sanitizeAndValidate(props.defaultValue, 'defaultValue');
    }

    const dismissWarning = (index) => {
      setSecurityWarnings(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <div>
        {/* Security Warnings */}
        {enableValidation && securityWarnings.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Security Warnings Detected
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {securityWarnings.map((warning, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>
                          Field "{warning.field}": {warning.threats.join(', ')}
                        </span>
                        <button
                          onClick={() => dismissWarning(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wrapped Component with Security Props */}
        <WrappedComponent
          {...props}
          {...securePropOverrides}
        />
      </div>
    );
  };
};

/**
 * Hook to add XSS protection to any form
 */
export const useXSSProtection = (options = {}) => {
  const {
    sanitizationLevel = 'strict',
    enableValidation = false,
    logAttempts = false
  } = options;

  const [securityLog, setSecurityLog] = React.useState([]);

  const protectInput = React.useCallback((value, fieldName = 'unknown') => {
    if (typeof value !== 'string') return value;

    // Validate for XSS
    const validation = validateXSS(value);
    
    if (!validation.isValid) {
      const logEntry = {
        field: fieldName,
        threats: validation.threats,
        timestamp: new Date(),
        originalValue: value.substring(0, 50)
      };

      if (enableValidation) {
        setSecurityLog(prev => [...prev, logEntry]);
      }

      if (logAttempts) {
        console.warn('XSS attempt detected:', logEntry);
      }
    }

    // Return sanitized value
    return sanitizeInput(value);
  }, [sanitizationLevel, enableValidation, logAttempts]);

  const protectedOnChange = React.useCallback((originalOnChange) => {
    return (e) => {
      const protectedValue = protectInput(e.target.value, e.target.name);
      const protectedEvent = {
        ...e,
        target: {
          ...e.target,
          value: protectedValue
        }
      };
      originalOnChange(protectedEvent);
    };
  }, [protectInput]);

  const protectedOnSubmit = React.useCallback((originalOnSubmit) => {
    return (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const protectedData = {};
      
      for (const [key, value] of formData.entries()) {
        protectedData[key] = protectInput(value, key);
      }
      
      const protectedEvent = {
        ...e,
        protectedData,
        preventDefault: () => {} // Already prevented
      };
      
      originalOnSubmit(protectedEvent);
    };
  }, [protectInput]);

  const clearSecurityLog = React.useCallback(() => {
    setSecurityLog([]);
  }, []);

  return {
    protectInput,
    protectedOnChange,
    protectedOnSubmit,
    securityLog,
    clearSecurityLog,
    hasSecurityWarnings: securityLog.length > 0
  };
};

/**
 * React Context for global XSS protection settings
 */
export const XSSProtectionContext = React.createContext({
  enabled: true,
  sanitizationLevel: 'strict',
  enableValidation: false,
  logAttempts: false
});

export const XSSProtectionProvider = ({ 
  children, 
  enabled = true, 
  sanitizationLevel = 'strict',
  enableValidation = false,
  logAttempts = false 
}) => {
  return (
    <XSSProtectionContext.Provider value={{
      enabled,
      sanitizationLevel,
      enableValidation,
      logAttempts
    }}>
      {children}
    </XSSProtectionContext.Provider>
  );
};

export const useXSSProtectionContext = () => {
  return React.useContext(XSSProtectionContext);
};
