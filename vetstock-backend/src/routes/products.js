const router = require('express').Router();
const {pool} = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /products - Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const {rows} = await pool.query(
            'SELECT * FROM products ORDER BY name ASC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar produtos:', err);
        res.status(500).json({ error: 'Erro ao listar produtos' });
    }
});

// POST /products - Criar um novo produto
router.post('/', async (req, res) => {
    try {
        const {name, category, quantity, min_quantity,
               unit, price, supplier, expiry_date} = req.body;

        if (!name || !unit || quantity === undefined || min_quantity === undefined) {
            return res.status(400).json({ error: 'Campos obrigatórios: name, unit, quantity, min_quantity' });
        }

        const {rows} = await pool.query(
            `INSERT INTO products (name, category, quantity, min_quantity, unit, price, supplier, expiry_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, category, quantity, min_quantity, unit, price, supplier, expiry_date]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao criar produto:', err);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// PUT /products/:id - Atualizar um produto
router.put('/:id', async (req, res) => {
    try {
        const {name, category, quantity, min_quantity, unit, price, supplier, expiry_date} = req.body;

        const {rows} = await pool.query(
            `UPDATE products
             SET name = $1, category = $2, quantity = $3, min_quantity = $4, unit = $5, price = $6, supplier = $7, expiry_date = $8, last_updated = NOW()
             WHERE id = $9 RETURNING *`,
            [name, category, quantity, min_quantity, unit, price, supplier, expiry_date, req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar produto:', err);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// PATCH /products/:id/quantity - Atualizar a quantidade de um produto
router.patch('/:id/quantity', async (req, res) => {
    try {
        const {delta} = req.body;

        if (delta === undefined) {
            return res.status(400).json({ error: 'Campo obrigatório: delta' });
        }

        const {rows} = await pool.query(
            `UPDATE products
             SET quantity = GREATEST(0, quantity + $1), last_updated = NOW()
             WHERE id = $2 RETURNING *`,
            [delta, req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar quantidade:', err);
        res.status(500).json({ error: 'Erro ao atualizar quantidade' });
    }
});

// DELETE /products/:id - Deletar um produto
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(200).json({ success: true, message: 'Produto deletado com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar produto:', err);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

module.exports = router;