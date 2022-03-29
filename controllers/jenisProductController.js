const { db, dbQuery } = require('../supports/database')

module.exports = {
    getJenisProduct: async (req, res) => {
        try {
            let getJenisProduct = await dbQuery(`SELECT * FROM jenis_products`)
            res.status(200).send({
                success: true,
                message: 'success get JenisProduct',
                dataJenisProduct: getJenisProduct
            })
        } catch (error) {
            res.status(500).send({
                message: 'failed',
                success: false,
                error: error
            })
        }
    }
}