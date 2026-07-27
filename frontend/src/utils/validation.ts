export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Please enter a valid email address';
};

export const validatePassword = (password: string): string | null => {
  return password.length >= 8 ? null : 'Password must be at least 8 characters';
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateTaskTitle = (title: string): string | null => {
  if (!validateRequired(title)) return 'Title is required';
  if (title.length > 200) return 'Title must be less than 200 characters';
  return null;
};

export const validateSubjectName = (name: string): string | null => {
  if (!validateRequired(name)) return 'Name is required';
  if (name.length > 100) return 'Name must be less than 100 characters';
  return null;
};

export const validateScheduleTimes = (start: string, end: string): string | null => {
  if (!start || !end) return 'Start and end times are required';
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if (startH * 60 + startM >= endH * 60 + endM) {
    return 'End time must be after start time';
  }
  return null;
};

export const validatePasswordsMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};
