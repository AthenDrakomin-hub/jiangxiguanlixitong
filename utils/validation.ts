// Form validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRequired = (
  value: unknown,
  fieldName: string
): ValidationError | null => {
  if (value === null || value === undefined || value === '') {
    return { field: fieldName, message: `${fieldName} 是必填项` };
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): ValidationError | null => {
  if (value && value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} 至少需要 ${minLength} 个字符`,
    };
  }
  return null;
};

export const validateEmail = (
  email: string,
  fieldName: string
): ValidationError | null => {
  // 产品备注: 修复不必要的转义字符
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return { field: fieldName, message: `${fieldName} 格式不正确` };
  }
  return null;
};

export const validatePhone = (
  phone: string,
  fieldName: string
): ValidationError | null => {
  // Simple phone validation (allows +, spaces, dashes, parentheses)
  // 产品备注: 修复不必要的转义字符
  const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
  if (phone && !phoneRegex.test(phone)) {
    return { field: fieldName, message: `${fieldName} 格式不正确` };
  }
  return null;
};

export const validateNumber = (
  value: unknown,
  fieldName: string
): ValidationError | null => {
  if (value !== undefined && value !== null && isNaN(Number(value))) {
    return { field: fieldName, message: `${fieldName} 必须是数字` };
  }
  return null;
};

export const validatePositiveNumber = (
  value: unknown,
  fieldName: string
): ValidationError | null => {
  const numError = validateNumber(value, fieldName);
  if (numError) return numError;

  if (value !== undefined && value !== null && Number(value) <= 0) {
    return { field: fieldName, message: `${fieldName} 必须大于0` };
  }
  return null;
};

// Validate a form with multiple fields
export const validateForm = (
  validators: (() => ValidationError | null)[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  validators.forEach((validator) => {
    const error = validator();
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};
