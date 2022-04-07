const { db, dbQuery } = require('../supports/database')

module.exports = {
    addCart: async (req, res) => {
        try {
            let { qty, catatan, idproduct, idstock } = req.body
            console.log(req.body)
            let getData = await dbQuery(`SELECT * FROM carts WHERE iduser='28' AND idproduct=${idproduct} AND idstock=${idstock} `)
            if (getData.length == 0) {
                await dbQuery(`INSERT INTO carts VALUES (null, 28, ${req.body.idproduct}, ${req.body.idstock},  ${db.escape(qty)}, ${db.escape(catatan)})`)
            }else {
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
    getCart: async (req,res) => {
        try {
            let resultCart = await dbQuery(`SELECT * FROM carts WHERE iduser=28`)
            let resultProducts = await dbQuery(`SELECT idproduct, nama, harga, deskripsi FROM products`)
            let resultImages = await dbQuery(`SELECT * FROM images`)
            let resultStocks = await dbQuery(`SELECT * FROM stocks`)
            
            resultCart.forEach((item,index) => {
                item.products = []
                item.images = []
                item.stocks = []

                resultProducts.forEach((item2,index) =>{
                    if(item.idproduct == item2.idproduct){
                        item.products.push(item2)
                    }
                })
                resultImages.forEach((item3,index) => {
                    if(item.idproduct == item3.idproduct){
                        item.images.push(item3)
                    }
                })
                resultStocks.forEach((item4,index) => {
                    if(item.idproduct == item4.idproduct)
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
    updateQtyCart: async(req,res) => {
        try {
            await dbQuery(`UPDATE carts SET qty=${req.body.qty} WHERE idcart=${req.params.idcart}`)
            
            res.status(200).send({
                message: 'success update qty',
                success: true
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
    deleteCart: async(req,res) => {
        try {
            await dbQuery(`DELETE FROM carts WHERE idcart=${req.params.idcart}`)

            res.status(200).send({
                message: 'success delete qty',
                success: true
            })
        } catch (error) {
            console.log('error')
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    }
}