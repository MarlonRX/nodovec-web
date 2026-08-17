import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  name: z.string(),
  email: z.string(),
  email_verified_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const LoginCredentialsSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const RegisterDataSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
});

const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  token_type: z.string().default("Bearer"),
  expires_in: z.number(),
});

export type User = z.infer<typeof UserSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegisterData = z.infer<typeof RegisterDataSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
