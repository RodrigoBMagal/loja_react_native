import { z } from 'zod';

const idParam = z.object({
  id: z.string().regex(/^\d+$/, 'Id inválido'),
});

const dateStringToDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expiry_date deve estar no formato YYYY-MM-DD')
  .nullable()
  .optional();

const productBody = {
  name: z.string().trim().min(1, 'Campo obrigatório: name'),
  category: z.string().trim().optional().nullable(),
  quantity: z.coerce.number({ required_error: 'Campos obrigatórios: name, unit, quantity, min_quantity' })
    .int('quantity deve ser um número inteiro')
    .min(0, 'quantity não pode ser negativo'),
  min_quantity: z.coerce.number({ required_error: 'Campos obrigatórios: name, unit, quantity, min_quantity' })
    .int('min_quantity deve ser um número inteiro')
    .min(0, 'min_quantity não pode ser negativo'),
  unit: z.string().trim().min(1, 'Campo obrigatório: unit'),
  price: z.coerce.number().min(0, 'price não pode ser negativo').optional().nullable(),
  supplier: z.string().trim().optional().nullable(),
  expiry_date: dateStringToDate,
};

export const createProductSchema = z.object({
  body: z.object(productBody),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateProductSchema = z.object({
  body: z.object(productBody),
  params: idParam,
  query: z.object({}).optional(),
});

export const updateQuantitySchema = z.object({
  body: z.object({
    delta: z.coerce.number({ required_error: 'Campo obrigatório: delta' }).int('delta deve ser um número inteiro'),
  }),
  params: idParam,
  query: z.object({}).optional(),
});

export const productIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: idParam,
  query: z.object({}).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>['body'];
