import { useState, useCallback } from 'react';

export function useForm<T extends Record<string, unknown>>(
  initialValues: T
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback(
    (field: keyof T, value: unknown) => {
      setValues(prev => ({ ...prev, [field]: value }));
      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: unknown) => {
      handleChange(field, value);
    },
    [handleChange]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const setAllValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const validate = useCallback(
    (validationFn: (vals: T) => Partial<Record<keyof T, string>>): boolean => {
      const validationErrors = validationFn(values);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    },
    [values]
  );

  return {
    values,
    errors,
    handleChange,
    setFieldValue,
    setAllValues,
    reset,
    validate,
    setErrors,
  };
}
