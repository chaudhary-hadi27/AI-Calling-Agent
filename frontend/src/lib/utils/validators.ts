/**
 * Common passwords list (top 100 most common)
 * In production, fetch from API or expand this list
 */
const COMMON_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', '123456789',
  '12345', '1234', '111111', '1234567', 'dragon',
  '123123', 'baseball', 'iloveyou', 'trustno1', '1234567890',
  'sunshine', 'master', 'welcome', 'shadow', 'ashley',
  'football', 'jesus', 'michael', 'ninja', 'mustang',
  'password1', 'admin', 'letmein', 'monkey', '000000',
];

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
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
};

/**
 * ENTERPRISE-GRADE PASSWORD VALIDATION
 * Checks against multiple security criteria
 */
export const validatePasswordEnterprise = async (
  password: string,
  options: {
    checkPwned?: boolean;
    minLength?: number;
  } = {}
): Promise<{
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
  checks: Record<string, boolean>;
}> => {
  const minLength = options.minLength || 12;
  const checks = {
    minLength: password.length >= minLength,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noRepeats: !/(.)\1{2,}/.test(password),
    noSequential: !/(abc|bcd|cde|def|012|123|234|345|456|567|678|789|qwe|wer|ert|rty|asd|sdf|dfg|fgh|zxc|xcv|cvb)/i.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  // Check if password has been pwned (if enabled)
  if (options.checkPwned !== false) {
    try {
      checks['notPwned'] = !(await checkPwnedPassword(password));
    } catch {
      // If API fails, skip this check
      checks['notPwned'] = true;
    }
  }

  // Count passed checks
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (passedChecks < totalChecks * 0.6) {
    strength = 'weak';
  } else if (passedChecks < totalChecks * 0.85) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // Generate message
  let message = '';
  if (!checks.minLength) {
    message = `Password must be at least ${minLength} characters`;
  } else if (!checks.notCommon) {
    message = 'Password is too common';
  } else if (checks['notPwned'] === false) {
    message = 'This password has been exposed in a data breach';
  } else if (strength === 'weak') {
    message = 'Weak password - add more complexity';
  } else if (strength === 'medium') {
    message = 'Medium strength password';
  } else {
    message = 'Strong password';
  }

  return {
    isValid: checks.minLength && checks.notCommon && (checks['notPwned'] !== false),
    strength,
    message,
    checks,
  };
};

/**
 * Check if password appears in Have I Been Pwned database
 * Uses k-anonymity model (only sends first 5 chars of hash)
 */
export const checkPwnedPassword = async (password: string): Promise<boolean> => {
  try {
    // Hash password with SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Send only first 5 characters (k-anonymity)
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Pwned API error');
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Check if our suffix appears in the results
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Password is pwned
      }
    }

    return false; // Password not found
  } catch (error) {
    console.error('Error checking pwned password:', error);
    // On error, assume password is safe (fail open)
    return false;
  }
};

/**
 * Legacy password validation (for backwards compatibility)
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