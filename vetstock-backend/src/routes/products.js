const router = require('express').Router();
const {pool} = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /products - Listar todos os produtos

router.get('/', async (req, res) => {
    const {rows} = await pool.query(
        'SELECT * FROM products ORDER BY name ASC'
    );
    res.json(rows);
});

// POST /products - Criar um novo produto
router.post('/', async (req, res) => {
    const {name, category, quantity, min_quantity,
           unit, price, supplier, expiry_date} = req.body;

    const {rows} = await pool.query(
        `INSERT INTO products (name, category, quantity, min_quantity, unit, price, supplier, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, category, quantity, min_quantity, unit, price, supplier, expiry_date]
    );
    res.status(201).json(rows[0]);
});

// PATCH /products/:id/quantity - Atualizar a quantidade de um produto
router.patch('/:id/quantity', async (req, res) => {
    const {delta} = req.body;

    const {rows} = await pool.query(
        `UPDATE products
         SET quantity = GREATEST(0, quantity + $1), last_updated = NOW()
         WHERE id = $2 RETURNING *`,
        [delta, req.params.id]
    );
    res.json(rows[0]);
});

// DELETE /products/:id - Deletar um produto
router.delete('/:id', async (req, res) => {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.status(204).send();
});

module.exports = router;