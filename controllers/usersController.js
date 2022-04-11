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
    getData: (req, res, next) => {
        db.query(
            `SELECT * FROM users;`,
            (err, results) => {
                if (err) {
                    console.log(err)
                    res.status(400).send(err)
                };
                res.status(200).send(results);
            })
    },
    login: (req, res) => {
        let { password, email } = req.body
        // let hashPassword = Crypto.createHmac(`sha256`, `budi`).update(password).digest(`hex`);
        let loginScript = `Select * from users WHERE email=${db.escape(email)} and password=${db.escape(hashPassword(password))};`

        db.query(loginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: `Failed`,
                    error: err
                })
            }
            if (results.length > 0) {
                let { iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idstatus, idaddress } = results[0]
                let token = createToken({ iduser, idrole, idaddress,idstatus, username, email })
                res.status(200).send({
                    success: true,
                    message: `Login Success`,
                    dataLogin: { iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idstatus, idaddress, token },
                    err: ``
                })
            } else {
                res.status(500).send({
                    success: false,
                    message: `Login Failed`,
                    dataLogin: {},
                    err: err
                })
            }
        })
    },
    register: async (req, res) => {
        try {
            let { password, email, username } = req.body
            let getEmail = `Select * from users WHERE email = ${db.escape(email)};`
            let getUsername = `Select * from users WHERE username = ${db.escape(username)};`
            let insertSQL = `Insert into users (email, password, idrole, username, photo, idstatus) values (
                ${db.escape(email)}, 
                ${db.escape(hashPassword(password))},
                3,                                
                ${db.escape(username)},
                'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png',   
                1             
                );`
            let checkusername = await dbQuery(getUsername)
            let checkmail = await dbQuery(getEmail)
            if (checkmail.length || checkusername.length > 0) {
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
                    // get data user berdasarkan insertId
                    let getUser = await dbQuery(`Select * from users where iduser=${insertUser.insertId};`)
                    let { iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idstatus, idaddress } = getUser[0]
                    // let token = createToken({ iduser, nama, gender, username, umur, email, no_telpon, photo })
                    let token = createToken({ iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idstatus, idaddress })
                    // mengirimkan email yang berisi token untuk login
                    await transporter.sendMail({
                        from: 'Admin WoodAvenue',
                        to: req.body.email,
                        subject: 'Confirm Registration',
                        html: `<div>
                        <h3>Klik link dibawah ini untuk verifikasi akun anda</h3>
                        <a href='http://localhost:3000/verification/${token}'>Klik Disini</a>
                        </div>`
                    })
                    res.status(200).send({
                        success: true,
                        message: 'Register Success :white_check_mark:',
                        error: ''
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
    verification: async (req, res) => {
        try {
            console.log("req.dataUser", req.dataUser)
            let { iduser } = req.dataUser
            if (iduser) {
                await dbQuery(`UPDATE users SET idstatus = 3 WHERE iduser = ${db.escape(iduser)}`)                
                let verify = await dbQuery(`Select * from users WHERE iduser=${db.escape(iduser)};`)                
                if (verify.length > 0) {
                    let { iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo,idstatus, idaddress } = verify[0];
                    // let token = createToken({ iduser, username, email })
                    let token = createToken({ iduser, nama, gender, username, umur, email, no_telpon, photo })
                    // let token = createToken({ iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo,idstatus, idaddress })
                    res.status(200).send({
                        success: true,
                        message: "Login Success :white_check_mark:",
                        dataVerify: { idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idaddress, idstatus, token },
                        err: ''
                    })
                }

            } else {
                res.status(401).send({
                    success: false,
                    message: "Verify Failed :x:",
                    dataLogin: {},
                    err: ''
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed :x:",
                error: error
            })
        }
    },
    keepLogin: (req, res) => {
        console.log("cek req.dataUser", req.dataUser)
        console.log("cek req.body.data", req.body)
        db.query(`Select * from users WHERE iduser=${db.escape(req.dataUser.iduser)};`, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: `Failed`,
                    error: err
                })
            };
            console.log("ni bang dari keepLogin",results[0])
            if (results.length > 0) {
                let { iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idstatus,idaddress } = results[0]
                let token = createToken({ iduser, idrole, idaddress,idstatus, username, email })
                res.status(200).send({
                    success: true,
                    message: `Login Success`,
                    dataLogin: { iduser, idrole, idwarehouse, nama, gender, username, umur, email, no_telpon, photo, idstatus,idaddress, token },
                    err: ``
                })
            } else {
                res.status(500).send({
                    success: false,
                    message: `Login Failed`,
                    dataLogin: {},
                    err: ``
                })
            }
        })
    },
    editNama: async (req, res) => {
        try {
            console.log("req body nama", req.body.nama)
            let updateNama = await dbQuery(`Update users set nama=${db.escape(req.body.nama)} where iduser=${db.escape(req.dataUser.iduser)};`)
            res.status(200).send({
                success: true,
                message: "update nama success",
                data: updateNama
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
    editUmur: async (req, res) => {
        try {
            console.log("req body umur", req.body.umur)
            let updateUmur = await dbQuery(`Update users set umur=${db.escape(req.body.umur)} where iduser=${db.escape(req.dataUser.iduser)};`)
            res.status(200).send({
                success: true,
                message: "update umur success",
                data: updateUmur
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
    editGender: async (req, res) => {
        try {
            console.log("req body umur", req.body.gender)
            let updateGender = await dbQuery(`Update users set gender=${db.escape(req.body.gender)} where iduser=${db.escape(req.dataUser.iduser)};`)
            res.status(200).send({
                success: true,
                message: "update gender success",
                data: updateGender
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
    editPhone: async (req, res) => {
        try {
            console.log("req body umur", req.body.gender)
            let updateGender = await dbQuery(`Update users set no_telpon=${db.escape(req.body.no_telpon)} where iduser=${db.escape(req.dataUser.iduser)};`)
            res.status(200).send({
                success: true,
                message: "update gender success",
                data: updateGender
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
    editPhoto: async (req, res) => {
        try {
            const uploadFile = uploader('/imgProfile', 'IMGPROFILE').array("photo", 1);
            uploadFile(req, res, async(error)=> {
                let {photo} = req.body
                console.log("req body umur", req.body.photo)
                let updatePhoto = await dbQuery(`Update users set photo=${req.files[0] ? db.escape(`/imgProfile/${req.files[0].filename}`) : db.escape(photo)} where iduser=${db.escape(req.dataUser.iduser)};`)
                res.status(200).send({
                    success: true,
                    message: "update photo success",
                    data: updatePhoto
                })
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
    updateImageProfile: async (req, res) => {
        try {
            const updateFile = uploader('/imgProfile', 'IMGPROFILE').fields([{ name: 'images' }])
            updateFile(req, res, async (error) => {
                try {
                    let { photo } = JSON.parse(req.body.data)
                    console.log('cek uploadFileCover :', req.files);
                    let getImageBeforeUpdate = await dbQuery(`SELECT photo FROM users WHERE iduser=${db.escape(req.dataUser.iduser)}`)
                    await dbQuery(`UPDATE users SET photo=${photo ? photo : `'imgProducts/${req.files.images[0].filename}'`} WHERE iduser=${db.escape(req.dataUser.iduser)}`)
                    let getFileImage = getImageBeforeUpdate[0].photo.split('/')
                    if (photo == undefined) {
                        if (fs.existsSync(`./public/imgProfile/${getFileImage[getFileImage.length - 1]}`)) {
                            fs.unlinkSync(`./public/imgProfile/${getFileImage[getFileImage.length - 1]}`)
                        }
                    }
                    res.status(200).send({
                        success: true,
                        message: 'update images success'
                    })
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        success: false,
                        message: 'failed',
                        error: error
                    })
                }
            })

        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    },
    forgotpassword: async (req, res) => {
        try {
            console.log("req.body.email ", req.body)
            let getSQL = await dbQuery(`SELECT * FROM users WHERE email=${db.escape(req.body.email)};`)
            let { iduser, idrole, idstatus, username, email } = getSQL[0]
            let token = createToken({ iduser, idrole, idstatus, username, email })
            console.log("getSQL ", getSQL[0])
            await transporter.sendMail({
                from: "Admin WoodAvenue",
                to: req.body.email,
                subject: "Reset Password",
                html: `<div>
                        <h3>Klik Link dibawah ini untuk Reset Password anda</h3>
                        <a href='http://localhost:3000/resetpassword/${token}'>Click, Here to Reset Password</a>
                        </div>`
            })
            res.status(200).send({
                success: true,
                message: "Send Success :white_check_mark:",
                error: ""
            })
        } catch (error) {
            console.log(error)
            res.status(400).send({
                success: true,
                message: "Email not Exist :x:",
                error: ""
            });
        }
    },
    newpassword: async (req, res) => {
        console.log("req.dataUser newpassword ", req.dataUser)
        try {
            if (req.dataUser.iduser) {
                await dbQuery(`UPDATE users SET password=${db.escape(hashPassword(req.body.password))} WHERE iduser=${req.dataUser.iduser}`)
                let login = await dbQuery(`SELECT * FROM users WHERE iduser=${db.escape(req.dataUser.iduser)};`);
                if (login.length > 0) {
                    let { iduser, username, email, password, idrole, idstatus } = login[0];
                    let token = createToken({ iduser, username, email, idrole, idstatus });
                    res.status(200).send({
                        success: true,
                        message: "Update Success :white_check_mark:",
                        dataReset: { username, email, idrole, idstatus, iduser, token },
                        error: ""
                    })
                }
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Change Password Failed :x:",
                err: ''
            })
        }
    },
    getAddress: async (req, res) => {
        try {
            let getAddress = await dbQuery(`SELECT * FROM address WHERE iduser=${db.escape(req.dataUser.iduser)} ${req.query.idstatus ? `AND idstatus=${req.query.idstatus}` : '' } ORDER BY idstatus ;`)
            res.status(200).send({
                success: true,
                address: getAddress,
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
    addAddress: async (req, res) => {
        try {
            let { nama_penerima, alamat, no_telpon, kecamatan, kode_pos, idprovinsi, idkota } = req.body
            let provinsi,kota
            let getProvinsi = await axios.get(`/province?id=${idprovinsi}`)
            let getkota = await axios.get(`/city?id=${idkota}&province=${idprovinsi}`) 
            if(getProvinsi && getkota){
               provinsi = getProvinsi.data.rajaongkir.results.province
               kota = getkota.data.rajaongkir.results.city_name

            }
            let insertAddress = await dbQuery(`insert into address (iduser, idprovinsi, idkota, idstatus, nama_penerima, alamat, no_telpon, provinsi, kota, kecamatan, kode_pos) values(
                ${db.escape(req.dataUser.iduser)},
                ${db.escape(idprovinsi)},
                ${db.escape(idkota)},
                5,
                ${db.escape(nama_penerima)},
                ${db.escape(alamat)},
                ${db.escape(no_telpon)},
                ${db.escape(provinsi)},
                ${db.escape(kota)},
                ${db.escape(kecamatan)},
                ${db.escape(kode_pos)}
            );`)

            res.status(200).send({
                success: true,
                message: "Add address Success ✅"
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
    editAddress: async (req, res) => {
        try {
            let { nama_penerima, alamat, no_telpon, provinsi, kota, kecamatan, kode_pos } = req.body
            let insertAddress = await dbQuery(`update address set 
            nama_penerima=${db.escape(nama_penerima)},
            alamat=${db.escape(alamat)},
            no_telpon=${db.escape(no_telpon)},
            provinsi=${db.escape(provinsi)},
            kota=${db.escape(kota)},
            kecamatan=${db.escape(kecamatan)},
            kode_pos=${db.escape(kode_pos)}
            where idaddress=${db.escape(req.params.idaddress)}
            and iduser=${db.escape(req.dataUser.iduser)}
            ;`)

            res.status(200).send({
                success: true,
                message: "Edit Address Success ✅"
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
    deleteAddress: async (req, res) => {
        try {
            await dbQuery(`delete from address where idaddress=${db.escape(req.params.idaddress)} and iduser=${db.escape(req.dataUser.iduser)}`)
            res.status(200).send({
                success: true,
                message: "Delete Address Success ✅"
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
    chooseAddress: async (req, res) => {
        try {
            let getAlamat = await dbQuery( `SELECT * FROM address WHERE iduser=${req.dataUser.iduser}`)
            if(getAlamat.length > 0) {
                getAlamat.forEach(async(item,index) => {
                    await dbQuery(`UPDATE address SET idstatus=5 WHERE idaddress=${item.idaddress}`)
                })
                await dbQuery(`UPDATE address SET idstatus=${db.escape(req.body.idstatus)} WHERE idaddress=${db.escape(req.params.idaddress)}`)
            }
            // console.log('isi req body',req.body)
            res.status(200).send({
                success: true,
                message: "choose address success",
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
    inputDataUser: async (req, res, next) => {
        try {
            console.log(req.body)
            let { nama, gender, email, umur, photo, no_telpon } = req.body
            // 1. update data untuk table users
            let updateProfile = await dbQuery(`UPDATE users SET nama=${db.escape(nama)}, gender=${db.escape(gender)}, 
                email=${db.escape(email)}, umur=${db.escape(umur)}, photo=${db.escape(photo)}, no_telpon=${db.escape(no_telpon)} WHERE iduser=3;`);

            // 2. mengirimkan response
            res.status(200).send({
                success: true,
                message: "update data success",
                data: updateProfile
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
}