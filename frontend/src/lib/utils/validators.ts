/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (US format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === "1");
};

/**
 * Validate password strength
 * Returns: { isValid: boolean, strength: 'weak' | 'medium' | 'strong', message: string }
 */
export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      strength: "weak" as const,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
    Boolean
  ).length;

  if (strength <= 2) {
    return {
      isValid: true,
      strength: "weak" as const,
      message: "Weak password",
    };
  } else if (strength === 3) {
    return {
      isValid: true,
      strength: "medium" as const,
      message: "Medium strength password",
    };
  } else {
    return {
      isValid: true,
      strength: "strong" as const,
      message: "Strong password",
    };
  }
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size (in MB)
 */
export const isValidFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Combined form validation helper
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export const validate = (
  value: any,
  rules: ValidationRule
): { isValid: boolean; message: string } => {
  if (rules.required && !isRequired(value)) {
    return { isValid: false, message: rules.message || "This field is required" };
  }

  if (typeof value === "string") {
    if (rules.minLength && !minLength(value, rules.minLength)) {
      return {
        isValid: false,
        message: rules.message || `Minimum length is ${rules.minLength}`,
      };
    }

    if (rules.maxLength && !maxLength(value, rules.maxLength)) {
      return {
        isValid: false,
        message: rules.message || `Maximum length is ${rules.maxLength}`,
      };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        isValid: false,
        message: rules.message || "Invalid format",
      };
    }
  }

  if (rules.custom && !rules.custom(value)) {
    return {
      isValid: false,
      message: rules.message || "Validation failed",
    };
  }

  return { isValid: true, message: "" };
};