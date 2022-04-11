const { db, dbQuery } = require("../supports/database");

module.exports = {
    getWarehouse : async (req,res) => {
        try {
            let getWarehouse = await dbQuery(`SELECT * FROM warehouse`)
            res.status(200).send({
                success: true,
                message: 'success get data warehouse',
                dataWarehouse: getWarehouse
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                message: 'failed',
                success: false,
                error: error
            })
        }
    }
}