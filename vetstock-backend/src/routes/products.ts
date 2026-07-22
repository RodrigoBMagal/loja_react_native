import { Router, Request, Response } from 'express';
import { Prisma, Product } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  updateQuantitySchema,
  productIdParamSchema,
  CreateProductInput,
  UpdateQuantityInput,
} from '../schemas/product.schema';

const router = Router();

router.use(authMiddleware);

/** Formata a resposta do produto no mesmo contrato (snake_case) que o app React Native espera. */
const serializeProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  quantity: product.quantity,
  min_quantity: product.minQuantity,
  unit: product.unit,
  price: product.price === null ? null : Number(product.price),
  supplier: product.supplier,
  expiry_date: product.expiryDate ? product.expiryDate.toISOString().slice(0, 10) : null,
  last_updated: product.lastUpdated,
});

const toProductData = (body: CreateProductInput) => ({
  name: body.name,
  category: body.category ?? null,
  quantity: body.quantity,
  minQuantity: body.min_quantity,
  unit: body.unit,
  price: body.price ?? null,
  supplier: body.supplier ?? null,
  expiryDate: body.expiry_date ? new Date(body.expiry_date) : null,
});

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Lista todos os produtos, ordenados por nome
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao listar produtos
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    return res.json(products.map(serializeProduct));
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    return res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro ao criar produto
 */
router.post('/', validate(createProductSchema), async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateProductInput;
    const product = await prisma.product.create({ data: toProductData(body) });
    return res.status(201).json(serializeProduct(product));
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto existente
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Produto atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao atualizar produto
 */
router.put('/:id', validate(updateProductSchema), async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateProductInput;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: toProductData(body),
    });
    return res.json(serializeProduct(product));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    console.error('Erro ao atualizar produto:', err);
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

/**
 * @openapi
 * /products/{id}/quantity:
 *   patch:
 *     summary: Ajusta a quantidade em estoque de um produto (delta positivo ou negativo)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [delta]
 *             properties:
 *               delta:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Quantidade atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao atualizar quantidade
 */
router.patch('/:id/quantity', validate(updateQuantitySchema), async (req: Request, res: Response) => {
  try {
    const { delta } = req.body as UpdateQuantityInput;
    const id = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const nextQuantity = Math.max(0, existing.quantity + delta);
    const product = await prisma.product.update({
      where: { id },
      data: { quantity: nextQuantity },
    });

    return res.json(serializeProduct(product));
  } catch (err) {
    console.error('Erro ao atualizar quantidade:', err);
    return res.status(500).json({ error: 'Erro ao atualizar quantidade' });
  }
});

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Remove um produto do estoque
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Produto removido com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao deletar produto
 */
router.delete('/:id', validate(productIdParamSchema), async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    return res.status(200).json({ success: true, message: 'Produto deletado com sucesso' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    console.error('Erro ao deletar produto:', err);
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
