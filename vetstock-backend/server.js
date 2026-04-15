require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {createTables} = require('./src/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', require('./src/routes/auth'));
app.use('/products', require('./src/routes/products'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

createTables().then(() => {
    app.listen(process.env.PORT, () => 
        console.log(`Server running on port ${process.env.PORT}`)
    );
});
