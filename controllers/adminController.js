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
            // let getWarehouse = await dbQuery(`SELECT * FROM warehouse;`)
            let getWarehouse = await dbQuery(`SELECT * FROM warehouse where idstatus = 1;`)
            res.status(200).send({
                success: true,
                warehouse: getWarehouse,
                message: 'Get Warehouse Success'
            });
        } catch (error) {
            console.log('Get Address failed', error)
            res.status(500).send({
                success: false,
                message: 'Get Warehouse error',
                error
            });
        }
    },
    getAdmin: async (req, res) => {
        try {
            let getAdmin = await dbQuery(`SELECT u.*, w.nama FROM users u join warehouse w on u.idwarehouse = w.idwarehouse where idrole=2 and u.idstatus=1;`)
            res.status(200).send({
                success: true,
                getAdmin: getAdmin,
                message: 'Get Admin Success'
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
            let { nama, alamat, kecamatan, kode_pos, idprovinsi, idkota, latitude, longitude } = req.body
            let provinsi, kota
            let getProvinsi = await axios.get(`/province?id=${idprovinsi}`)
            let getkota = await axios.get(`/city?id=${idkota}&province=${idprovinsi}`)
            if (getProvinsi && getkota) {
                provinsi = getProvinsi.data.rajaongkir.results.province
                kota = getkota.data.rajaongkir.results.city_name

            }
            let insertWarehouse = await dbQuery(`insert into warehouse ( idprovinsi, idkota, nama, alamat, provinsi, kota, kecamatan, kode_pos, latitude, longitude, idstatus) values(                
                ${db.escape(idprovinsi)},
                ${db.escape(idkota)},                
                ${db.escape(nama)},
                ${db.escape(alamat)},                
                ${db.escape(provinsi)},
                ${db.escape(kota)},
                ${db.escape(kecamatan)},
                ${db.escape(kode_pos)},
                ${db.escape(latitude)},
                ${db.escape(longitude)},
                1
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
            let { password, email, username, idwarehouse, no_telpon } = req.body
            let getEmail = `Select * from users WHERE email = ${db.escape(email)};`
            let getUsername = `Select * from users WHERE username = ${db.escape(username)};`
            let insertSQL = `Insert into users (email, password, idrole, username, photo, idstatus, idwarehouse, no_telpon) values (
                ${db.escape(email)}, 
                ${db.escape(hashPassword(password))},
                2,                                
                ${db.escape(username)},
                '/imgProfile/defaultPP.png',   
                1,
                ${db.escape(idwarehouse)},
                ${db.escape(no_telpon)}            
                );`
            let checkusername = await dbQuery(getUsername)
            let checkmail = await dbQuery(getEmail)
            console.log("checkmail length", checkmail.length)
            console.log("checkusername", checkusername.length)
            console.log("cek geAdmin",)
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
    deleteAdmin: async (req, res) => {
        try {
            console.log(`cek dataUser`, req.dataUser)
            if (req.dataUser.idrole == 1) {
                await dbQuery(`update users set idstatus = 2 where iduser=${req.params.iduser};`)
                res.status(200).send({
                    success: true,
                    message: "Success Delete Admin"
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "You can't access this API"
                })
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                message: `Failed`,
                error: error
            })
        }
    },
    deleteWarehouse: async (req, res) => {
        try {
            console.log(`cek dataUser`, req.dataUser)
            if (req.dataUser.idrole == 1) {
                await dbQuery(`update warehouse set idstatus = 2 where idwarehouse=${req.params.idwarehouse};`)
                res.status(200).send({
                    success: true,
                    message: "Success Delete Warehouse"
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "You can't access this API"
                })
            }
        } catch (error) {
            res.status(500).send({
                success: false,
                message: `Failed`,
                error: error
            })
        }
    },
    updateAdmin: async (req, res) => {
        try {
            let { email, username, idwarehouse, no_telpon } = req.body
            if (req.dataUser.idrole == 1) {
                let updateAdmin = await dbQuery(`update users set
                username = ${db.escape(username)},
                email = ${db.escape(email)},
                no_telpon = ${db.escape(no_telpon)},
                idwarehouse = ${db.escape(idwarehouse)}
                where iduser = ${req.params.iduser}
                ;`)

                res.status(200).send({
                    success: true,
                    message: "Update Admin Success",
                    data: updateAdmin
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "You can't access this API"
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed",
                error: error
            })
        }
    },
    updateWarehouse: async (req, res) => {
        try {
            let { nama, alamat, kecamatan, kode_pos, idprovinsi, idkota, latitude, longitude } = req.body
            if (req.dataUser.idrole == 1) {
                let updateWarehouse = await dbQuery(`update warehouse set
                nama = ${db.escape(nama)},
                alamat = ${db.escape(alamat)},
                kecamatan = ${db.escape(kecamatan)},
                kode_pos = ${db.escape(kode_pos)},
                idprovinsi = ${db.escape(idprovinsi)},
                idkota = ${db.escape(idkota)},
                latitude = ${db.escape(latitude)},
                longitude = ${db.escape(longitude)}
                where idwarehouse = ${req.params.idwarehouse}
                ;`)

                res.status(200).send({
                    success: true,
                    message: "Update Warehouse Success",
                    data: updateWarehouse
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "You can't access this API"
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed",
                error: error
            })
        }
    }
}