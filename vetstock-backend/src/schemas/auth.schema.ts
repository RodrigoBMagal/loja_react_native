import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Informe usuário e senha' })
      .trim()
      .min(1, 'Informe usuário e senha'),
    password: z
      .string({ required_error: 'Informe usuário e senha' })
      .min(1, 'Informe usuário e senha'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
