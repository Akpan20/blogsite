import { z } from 'zod';

const registrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const validateRegistration = (data: unknown) => {
  const result = registrationSchema.safeParse(data);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
};

export const validateLogin = (data: unknown) => {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
};