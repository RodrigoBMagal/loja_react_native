const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

//POST /auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Informe o usuário e a senha' });
    }

    try {
        const {rows} = await pool.query(
            'SELECT * FROM users WHERE username = $1', [username]
        );

        if (!rows.length) {
            return res.status(401).json({error: 'Usuário ou senha inválidos'});
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({error: 'Usuário ou senha inválidos'});
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.json({ token, user: {id: user.id, username: user.username, role: user.role} });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno' });
    }
});

module.exports = router;