const { db, dbQuery } = require('../supports/database')

module.exports = {
    getJenisProduct: async (req, res) => {
        try {
            let filterQuery = []
            for (prop in req.query) {
                filterQuery.push(`${prop == 'kategori' ? `j.idkategori=${req.query[prop]}` : ''}`)
            }
            let getJenisProduct = await dbQuery(`SELECT j.*, k.kategori FROM jenis_products as j
            JOIN kategori as k ON j.idkategori = k.idkategori
            ${filterQuery.length > 0 ? `AND ${filterQuery.join('AND')}` : ''}`)
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