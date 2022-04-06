const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bearerToken = require("express-bearer-token")
dotenv.config();

const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(express.static('public.'));
app.use(bearerToken()); // untuk mengambil data token dari req.header client

// DB Check Connection
const { db } = require(`./supports/database`)
db.getConnection((err, connection) => {
    if (err) {
        console.log(`Error Mysql Connection : `, err, message);
    }
    console.log(`Connected to MySql Server : ${connection.threadId}`)
})

// Routes API Setup
app.get(`/`, (req, res) => res.status(200).send(`<h2>Welcome to woodavenue API</h2>`))
const { usersRoute } = require(`./routers`)


app.use(`/users`, usersRoute);

app.listen(PORT, () => console.log("Your API RUNNING :", PORT));