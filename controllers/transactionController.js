const { db, dbQuery } = require('../supports/database')
const axios = require('axios')
const { uploader } = require('../supports/uploader')
const fs = require('fs')

axios.defaults.baseURL = 'https://api.rajaongkir.com/starter'
axios.defaults.headers.common['key'] = 'e16ebfa0c9d8e75186df8a9122d40fa4'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

module.exports = {
    addCart: async (req, res) => {
        try {
            let { qty, catatan, idproduct, idstock } = req.body
            console.log(req.body)
            let getData = await dbQuery(`SELECT * FROM carts WHERE iduser=${req.dataUser.iduser} AND idproduct=${idproduct}`)
            if (getData.length == 0) {
                await dbQuery(`INSERT INTO carts VALUES (null, ${req.dataUser.iduser}, ${req.body.idproduct}, ${req.body.total_stock_product},  ${db.escape(qty)}, ${db.escape(catatan)})`)
            } else {
                await dbQuery(`UPDATE carts SET qty=${getData[0].qty + qty} WHERE idcart=${getData[0].idcart}`)
            }
            res.status(200).send({
                success: true,
                message: 'add to cart success',
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
    getCart: async (req, res) => {
        try {
            let resultCart = await dbQuery(`SELECT * FROM carts WHERE iduser=${req.dataUser.iduser}`)
            let resultProducts = await dbQuery(`SELECT idproduct, nama, harga, deskripsi, berat FROM products`)
            let resultImages = await dbQuery(`SELECT * FROM images`)

            resultCart.forEach((item, index) => {
                item.products = []
                item.images = []

                resultProducts.forEach((item2, index) => {
                    if (item.idproduct == item2.idproduct) {
                        item.products.push(item2)
                    }
                })
                resultImages.forEach((item3, index) => {
                    if (item.idproduct == item3.idproduct) {
                        item.images.push(item3)
                    }
                })
            })

            res.status(200).send({
                success: true,
                message: 'get data cart success',
                dataCart: resultCart
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
    updateQtyCart: async (req, res) => {
        try {
            await dbQuery(`UPDATE carts SET qty=${req.body.qty} WHERE idcart=${req.params.idcart}`)

            res.status(200).send({
                message: 'success update qty',
                success: true
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
    deleteCart: async (req, res) => {
        try {
            await dbQuery(`DELETE FROM carts WHERE idcart=${req.params.idcart}`)

            res.status(200).send({
                message: 'success delete qty',
                success: true
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
    getOngkir: async (req, res) => {
        try {
            let response = await axios.post('/cost', {
                origin: req.body.asal,
                destination: req.body.tujuan,
                weight: req.body.berat,
                courier: req.body.kurir
            })
            res.status(200).send({
                success: true,
                message: 'get data ongkir success',
                dataOngkir: response.data.rajaongkir.results[0]
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
    checkout: async (req, res) => {
        try {
            let { idwarehouse, idstatus, idaddress, invoice, total_tagihan, ongkir, pajak, added_date } = req.body
            //insert table transaksi
            let insertTransaction = await dbQuery(`INSERT INTO transaksi (iduser, idwarehouse, idstatus, invoice, total_tagihan, ongkir, pajak, added_date)
            VALUES (${req.dataUser.iduser}, ${db.escape(idwarehouse)},
             ${db.escape(idstatus)}, ${db.escape(invoice)}, ${db.escape(total_tagihan)},
             ${db.escape(ongkir)}, ${db.escape(pajak)}, ${db.escape(added_date)});`)
            if (insertTransaction.insertId) {
                //insert table detail transaksi
                await dbQuery(`INSERT INTO detail_transaksi (idtransaksi, idproduct, idaddress, qty, catatan, sub_total)
                  VALUES ${req.body.detail.map(item => `(${insertTransaction.insertId}, ${db.escape(item.idproduct)}, ${db.escape(idaddress)}, ${db.escape(item.qty)}, ${db.escape(item.catatan)}, ${db.escape(item.products[0].harga * item.qty)})`).toString()}`)
                //delete data pada table cart
                await dbQuery(`DELETE FROM carts WHERE iduser=${req.dataUser.iduser}`)

                res.status(200).send({
                    message: 'success transaction',
                    success: true
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    },
    getTransaksi: async (req, res) => {
        try {
            filterQuery = []
            let getTransaksi
            for (prop in req.query) {
                if (prop == 'fromDate' || prop == 'toDate') {
                    filterQuery.push(`added_date ${prop == 'fromDate' ? '>=' : '<='} ${prop == 'toDate' ? db.escape(`${req.query[prop]} 23:59:59`) : db.escape(`${req.query[prop]} 00:00:00`)}`)
                } else {
                    filterQuery.push(`${prop == 'idstatus' ? 't.idstatus' : prop == 'idwarehouse' ? 't.idwarehouse' : prop}=${db.escape(req.query[prop])}`)
                }
            }
            if (req.dataUser.idrole == 1) {
                getTransaksi = await dbQuery(`SELECT t.*, u.nama as pembeli, w.nama as warehouse, s.status FROM transaksi as t
                JOIN warehouse as w ON w.idwarehouse = t.idwarehouse 
                JOIN status as s ON s.idstatus = t.idstatus
                JOIN users as u ON u.iduser = t.iduser
                ${filterQuery.length > 0 ? `WHERE ${filterQuery.join(" AND ")}` : ''} ORDER BY t.updated_date DESC`)
            } else if (req.dataUser.idrole == 2) {
                getTransaksi = await dbQuery(`SELECT t.*, u.nama as pembeli , w.nama as warehouse, s.status FROM transaksi as t
                JOIN warehouse as w ON w.idwarehouse = t.idwarehouse 
                JOIN status as s ON s.idstatus = t.idstatus
                JOIN users as u ON u.iduser = t.iduser
                WHERE t.idwarehouse=${req.dataUser.idwarehouse} ${filterQuery.length > 0 ? `AND ${filterQuery.join(" AND ")}` : ''} ORDER BY t.updated_date DESC`)
            } else if (req.dataUser.idrole == 3) {
                getTransaksi = await dbQuery(`SELECT t.*, w.nama as warehouse, s.status FROM transaksi as t
                JOIN warehouse as w ON w.idwarehouse = t.idwarehouse 
                JOIN status as s ON s.idstatus = t.idstatus
                WHERE t.iduser=${req.dataUser.iduser} ${filterQuery.length > 0 ? `AND ${filterQuery.join(" AND ")}` : ''} ORDER BY t.updated_date DESC`)

            }
            let getDetail = await dbQuery(`SELECT dt.*, p.nama, p.harga, a.nama_penerima, a.alamat, a.no_telpon, a.provinsi, a.kota, a.kecamatan, a.kode_pos, MIN(i.url) as images FROM detail_transaksi as dt 
            JOIN products AS p ON dt.idproduct = p.idproduct 
            JOIN address as a ON a.idaddress = dt.idaddress
            JOIN images as i ON i.idproduct = p.idproduct GROUP BY dt.iddetail_transaksi;`)

            getTransaksi.forEach((item, index) => {
                item.detail = []
                getDetail.forEach((item2, index) => {
                    if (item2.idtransaksi == item.idtransaksi) {
                        item.detail.push(item2)
                    }
                })
            })

            res.status(200).send({
                success: true,
                message: 'get transactions success',
                dataTransaksi: getTransaksi
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
    unggahReceipt: async (req, res) => {
        try {
            const unggahTF = uploader('/imgReceipt', 'IMGREC').fields([{ name: 'data' }])
            unggahTF(req, res, async (error) => {
                try {
                    let { date } = JSON.parse(req.body.date)
                    await dbQuery(`UPDATE transaksi SET idstatus=7, receipt='imgReceipt/${req.files.data[0].filename}', updated_date=${db.escape(date)}  WHERE idtransaksi=${req.params.idtransaksi}`)
                    res.status(200).send({
                        success: true,
                        message: 'upload receipt success'
                    })
                } catch (error) {
                    console.log('error')
                    fs.unlinkSync(`./public/imgReceipt/${req.files.data[0].filename}`)
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
    konfirmasiPesanan: async (req, res) => {
        try {
            await dbQuery(`UPDATE transaksi SET idstatus=${db.escape(req.body.idstatus)}, updated_date=${db.escape(req.body.date)} WHERE idtransaksi=${req.params.idtransaksi}`)
            getTransaksi = await dbQuery(`SELECT * FROM transaksi WHERE idtransaksi=${req.params.idtransaksi} AND idwarehouse=${db.escape(req.body.idwarehouse)}`)
            getStockWarehouse = await dbQuery(`SELECT * FROM stocks WHERE idwarehouse=${db.escape(req.body.idwarehouse)}`)
            if (getTransaksi[0].idstatus === 8) {
                getProductSold = await dbQuery(`SELECT dt.*, t.idwarehouse FROM detail_transaksi as dt
                JOIN transaksi as t ON t.idtransaksi = dt.idtransaksi
                where dt.idtransaksi=${db.escape(req.params.idtransaksi)};`)
                getProductSold.forEach(async (item, index) => {
                    getStockWarehouse.forEach(async (item2, index2) => {
                        if (item2.idproduct == item.idproduct && item2.idwarehouse == item.idwarehouse) {
                            await dbQuery(`UPDATE stocks SET qty=${item2.qty - item.qty} WHERE idproduct=${item2.idproduct} AND idwarehouse=${req.body.idwarehouse}`)
                            console.log(`UPDATE stocks SET qty=${item2.qty - item.qty} WHERE idproduct=${item2.idproduct} AND idwarehouse=${req.body.idwarehouse}`)
                        }
                    })
                })

            }
            res.status(200).send({
                success: true,
                message: 'Terima Barang success'
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    }
}