const { db, dbQuery } = require('../supports/database')
const axios = require('axios')
const { uploader } = require('../supports/uploader')
const fs = require('fs')

axios.defaults.baseURL = 'https://api.rajaongkir.com/starter'
axios.defaults.headers.common['key'] = 'e16ebfa0c9d8e75186df8a9122d40fa4'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
//idcart, iduser, idpero
module.exports = {
    // requestStock: (req, res) => {
    //     try {
    //         let {idwarehouse, idproduct, invoice, total_harga, ongkir, catatan, added_date, updated_date} = req.body
    //         let requestStock = `insert into transaksi_warehouse (iduser, idwarehouse, idproduct, idstatus, invoice, total_harga, ongkir, catatan, added_date, updated_date) values (
    //             ${db.escape(req.dataUser.iduser)},                
    //             ${db.escape(idwarehouse)},                
    //             ${db.escape(idproduct)},                
    //             7,
    //             ${db.escape(invoice)},                
    //             ${db.escape(total_harga)},                
    //             ${db.escape(ongkir)},                
    //             ${db.escape(catatan)},                
    //             ${db.escape(added_date)}.DATE_ADD(now().interval 7 hour),                
    //             ${db.escape(updated_date)}.DATE_ADD(now().interval 7 hour),                
    //         );`

    //         res.status(200).send({
    //             message: 'success transaction',
    //             success: true,
    //             requestStock: requestStock
    //         })
    //     } catch (error) {
    //         console.log(`cek request stock`,requestStock)
    //         res.status(500).send({
    //             success: false,
    //             message: 'failed',
    //             error: error
    //         })
    //     }
    // },
    addCartAdmin: async (req, res) => {
        try {
            let { qty, catatan, idproduct, idstock } = req.body
            console.log(req.body)
            let getData = await dbQuery(`SELECT * FROM carts WHERE iduser=${req.dataUser.iduser} AND idproduct=${idproduct} AND idstock=${idstock} `)
            if (getData.length == 0) {
                await dbQuery(`INSERT INTO carts VALUES (null, ${req.dataUser.iduser}, ${req.body.idproduct}, ${req.body.idstock},  ${db.escape(qty)}, ${db.escape(catatan)})`)
            } else {
                await dbQuery(`UPDATE carts SET qty=${getData[0].qty + qty} WHERE idcart=${getData[0].idcart}`)
            }
            res.status(200).send({
                success: true,
                message: 'add to cart success',
            })
        } catch (error) {
            console.log('error')
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    },
    getCartAdmin: async (req, res) => {
        try {
            let resultCart = await dbQuery(`SELECT * FROM carts WHERE iduser=${req.dataUser.iduser}`)
            let resultProducts = await dbQuery(`SELECT idproduct, nama, harga, deskripsi, berat FROM products`)
            let resultImages = await dbQuery(`SELECT * FROM images`)
            let resultStocks = await dbQuery(`SELECT * FROM stocks`)

            resultCart.forEach((item, index) => {
                item.products = []
                item.images = []
                item.stocks = []

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
                resultStocks.forEach((item4, index) => {
                    if (item.idproduct == item4.idproduct)
                        item.stocks.push(item4)
                })
            })

            res.status(200).send({
                success: true,
                message: 'get data cart success',
                dataCart: resultCart
            })

        } catch (error) {
            console.log('error')
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    },
    checkoutAdmin: async (req, res) => {
        try {
            let { idwarehouse, idstatus, invoice, total_tagihan, ongkir, pajak, added_date } = req.body
            //insert table transaksi
            let insertTransaction = await dbQuery(`INSERT INTO transaksi_warehouse (iduser, idwarehouse, idstatus, invoice, total_tagihan, ongkir, pajak, added_date)
            VALUES (${req.dataUser.iduser}, ${db.escape(idwarehouse)},
             ${db.escape(idstatus)}, ${db.escape(invoice)}, ${db.escape(total_tagihan)},
             ${db.escape(ongkir)}, ${db.escape(pajak)}, ${db.escape(added_date)});`)
            if (insertTransaction.insertId) {
                //insert table detail transaksi
                await dbQuery(`INSERT INTO detail_transaksi_warehouse (idtransaksi_warehouse, idwarehouse, idproduct, idstock, qty, catatan, sub_total)
                  VALUES ${req.body.detail.map(item => `(${insertTransaction.insertId},${db.escape(item.idwarehouse)}, ${db.escape(item.idproduct)}, ${db.escape(item.idstock)}, ${db.escape(item.qty)}, ${db.escape(item.catatan)}, ${db.escape(item.products[0].harga * item.qty)})`).toString()}`)
                //delete data pada table cart
                await dbQuery(`DELETE FROM carts WHERE iduser=${req.dataUser.iduser}`)

                res.status(200).send({
                    message: 'success transaction',
                    success: true
                })
            }
        } catch (error) {
            console.log('error')
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    },
    getWarehouseAdmin: async (req, res) => {
        try {
            // let getWarehouse = await dbQuery(`SELECT * FROM warehouse;`)
            let getWarehouseAdmin = await dbQuery(`select * from warehouse w join users u on w.idwarehouse = u.idwarehouse where u.iduser = ${req.dataUser.iduser};`)
            res.status(200).send({
                success: true,
                warehouseAdmin: getWarehouseAdmin,
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
}
