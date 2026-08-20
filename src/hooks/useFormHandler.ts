import { useState, useCallback, useRef, useEffect } from "react";

interface UseFormHandlerOptions<T> {
  initialValues: T;
  onSubmit: (data: T) => Promise<void> | void;
}

export const useFormHandler = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
}: UseFormHandlerOptions<T>) => {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValuesRef = useRef(initialValues);

  // Update ref after render commits to avoid mutation during render
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
      ? e.target.checked
      : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form después de submit exitoso
      setFormData(initialValuesRef.current);
    } catch (error: any) {
      const errorMessage = error?.message || "Error submitting form";
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialValuesRef.current);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
  };
};
