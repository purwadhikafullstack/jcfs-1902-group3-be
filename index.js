const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bearerToken = require("express-bearer-token")
dotenv.config();

const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bearerToken());

// DB Check Connection
const { db } = require('./supports/database')

db.getConnection((err, connection) => {
    if (err) {
        console.log('error mysql :', err.message)
    }

    console.log(`connection to mysal server : ${connection.threadId}`)
})

// Routes API Setup

app.get(`/`, (req, res) => res.status(200).send(`<h2>Welcome to woodavenue API</h2>`))

const { usersRoute, productRoute, kategoriRoute, materialRoute, jenisProductRoute, stockRoute, transactionRoute, addressRoute, adminRoute, warehouseRoute } = require('./routers')


app.use(`/users`, usersRoute);
app.use('/products', productRoute)
app.use('/kategori', kategoriRoute)
app.use('/material', materialRoute)
app.use('/jenis/products', jenisProductRoute)
app.use('/stock/sum', stockRoute)
app.use('/transactions', transactionRoute)
app.use('/alamat', addressRoute)
app.use('/admin', adminRoute)
app.use('/warehouse', warehouseRoute)

app.listen(PORT, () => console.log("Your API RUNNING :", PORT));