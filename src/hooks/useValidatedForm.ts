/**
 * Custom hook for form validation with Zod + React Hook Form
 *
 * Provides a consistent API for form handling across the application.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { z } from 'zod';

type UseValidatedFormOptions<T extends z.ZodType<FieldValues>> = Omit<
  UseFormProps<z.infer<T>>,
  'resolver'
> & {
  schema: T;
};

/**
 * Create a form with Zod validation
 *
 * @example
 * ```tsx
 * const { register, handleSubmit, formState: { errors } } = useValidatedForm({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' },
 * });
 * ```
 */
export function useValidatedForm<T extends z.ZodType<FieldValues>>(
  options: UseValidatedFormOptions<T>,
) {
  const { schema, ...formProps } = options;

  return useForm({
    ...formProps,
    resolver: zodResolver(schema as any) as any,
    mode: 'onBlur',
  });
}

/**
 * Type helper for form field errors
 */
export type FormErrors<T extends z.ZodType> = Partial<
  Record<keyof z.infer<T>, { message?: string }>
>;
