const { db, dbQuery } = require(`../supports/database`);
const fs = require("fs")
const { uploader } = require('../supports/uploader');
const { hashPassword, createToken } = require("../supports/enkripsi");
const { transporter } = require("../supports/nodemailer");
const Crypto = require(`crypto`);
const { default: axios } = require("axios");

axios.defaults.baseURL = 'https://api.rajaongkir.com/starter'
axios.defaults.headers.common['key'] = 'e16ebfa0c9d8e75186df8a9122d40fa4'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

module.exports = {
    getWarehouse: async (req, res) => {
        try {
            let getWarehouse = await dbQuery(`SELECT * FROM warehouse;`)
            res.status(200).send({
                success: true,
                warehouse: getWarehouse,
                message: 'Get Address Success'
            });
        } catch (error) {
            console.log('Get Address failed', error)
            res.status(500).send({
                success: false,
                message: 'Get Address error',
                error
            });
        }
    },
    addWarehouse: async (req, res) => {
        try {
            let { nama, alamat, kecamatan, kode_pos, idprovinsi, idkota } = req.body
            let provinsi, kota
            let getProvinsi = await axios.get(`/province?id=${idprovinsi}`)
            let getkota = await axios.get(`/city?id=${idkota}&province=${idprovinsi}`)
            if (getProvinsi && getkota) {
                provinsi = getProvinsi.data.rajaongkir.results.province
                kota = getkota.data.rajaongkir.results.city_name

            }
            let insertWarehouse = await dbQuery(`insert into warehouse ( idprovinsi, idkota, nama, alamat, provinsi, kota, kecamatan, kode_pos) values(                
                ${db.escape(idprovinsi)},
                ${db.escape(idkota)},                
                ${db.escape(nama)},
                ${db.escape(alamat)},                
                ${db.escape(provinsi)},
                ${db.escape(kota)},
                ${db.escape(kecamatan)},
                ${db.escape(kode_pos)}
            );`)

            res.status(200).send({
                success: true,
                message: "Add warehouse Success ✅"
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed",
                error: error
            })
        }
    },
    addAdmin: async (req, res) => {
        try {
            let { password, email, username } = req.body
            let getEmail = `Select * from users WHERE email = ${db.escape(email)};`
            let getUsername = `Select * from users WHERE username = ${db.escape(username)};`
            let insertSQL = `Insert into users (email, password, idrole, username, photo, idstatus) values (
                ${db.escape(email)}, 
                ${db.escape(hashPassword(password))},
                2,                                
                ${db.escape(username)},
                '/imgProfile/defaultPP.png',   
                1             
                );`
            let checkusername = await dbQuery(getUsername)
            let checkmail = await dbQuery(getEmail)
            console.log("checkmail length", checkmail.length)
            console.log("checkusername", checkusername.length)
            console.log("cek geAdmin", )
            if (checkmail.length > 0 || checkusername.length > 0) {
                if (checkmail.length > 0) {
                    res.status(400).send({
                        success: false,
                        message: "Email Exist",
                        error: ""
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: "Username Exist",
                        error: ""
                    })
                }
            } else {
                let insertUser = await dbQuery(insertSQL)
                if (insertUser.insertId) {
                    let getAdmin = await dbQuery(`Select * from users where iduser=${insertUser.insertId};`)
                    res.status(200).send({
                        success: true,
                        message: 'Create Admin Success :white_check_mark:',
                        dataAdmin: getAdmin
                    })
                }
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ",
                error: error
            });
        }
    },
}