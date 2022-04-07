const { db, dbQuery } = require('../supports/database')

module.exports = {
    getStockWarehouse: async (req, res) => {
        try {
            let filterQuery = []
            for (prop in req.query) {
                filterQuery.push(`${prop == 'nama' ? `p.nama LIKE ${db.escape(`%${req.query[prop]}%`)}` : ''}`)
            }
            let getTotalSumStock = await dbQuery(`SELECT p.nama, sum(s.qty) as stok FROM stocks as s 
            JOIN products as p ON s.idproduct = p.idproduct ${filterQuery.length > 0 ? `where ${filterQuery.join('AND')}` : ''} GROUP BY p.nama`)

            if(getTotalSumStock.length > 0) {
                res.status(200).send({
                    success: true,
                    message: 'success get total stock product',
                    dataTotalStock : getTotalSumStock
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
    }
}