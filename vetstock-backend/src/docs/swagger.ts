import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'VetStock API',
      version: '1.0.0',
      description:
        'API para gestão de estoque veterinário (produtos, quantidades e autenticação de usuários).',
    },
    servers: [
      { url: '/', description: 'Servidor atual' },
    ],
    tags: [
      { name: 'Auth', description: 'Autenticação de usuários' },
      { name: 'Products', description: 'Gestão de produtos em estoque' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      parameters: {
        ProductId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Id numérico do produto',
          schema: { type: 'integer', example: 1 },
        },
      },
      schemas: {
        LoginInput: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: '123456' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                role: { type: 'string', enum: ['admin', 'funcionario'] },
              },
            },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'quantity', 'min_quantity', 'unit'],
          properties: {
            name: { type: 'string', example: 'Amoxicilina 50mg' },
            category: { type: 'string', nullable: true, example: 'Medicamento' },
            quantity: { type: 'integer', example: 50 },
            min_quantity: { type: 'integer', example: 10 },
            unit: { type: 'string', example: 'unidade' },
            price: { type: 'number', format: 'float', nullable: true, example: 25.5 },
            supplier: { type: 'string', nullable: true, example: 'Fornecedor A' },
            expiry_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              example: '2026-12-31',
            },
          },
        },
        Product: {
          allOf: [
            { $ref: '#/components/schemas/ProductInput' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                last_updated: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '..', 'routes', '*.ts'),
    path.join(__dirname, '..', 'routes', '*.js'),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
