const { db, dbQuery } = require('../supports/database')

module.exports = {
    getkategori: async (req, res) => {
        try {
            let getkategori = await dbQuery(`SELECT * FROM kategori`)
            res.status(200).send({
                success: true,
                message: 'success get kategori',
                dataKategori: getkategori
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