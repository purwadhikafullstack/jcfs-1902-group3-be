const { db, dbQuery } = require('../supports/database')

module.exports = {
    getMaterial: async (req, res) => {
        try {
            let getmaterial = await dbQuery(`SELECT * FROM material`)
            res.status(200).send({
                success: true,
                message: 'success get material',
                dataMaterial: getmaterial
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