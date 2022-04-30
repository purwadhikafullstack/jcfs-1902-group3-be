const { db, dbQuery } = require("../supports/database");

module.exports = {
    getWarehouse : async (req,res) => {
        try {
            filterQuery = []
            for (prop in req.query){
                filterQuery.push(`${prop}=${db.escape(req.query[prop])}`)
            }
            let getWarehouse = await dbQuery(`SELECT * FROM warehouse ${filterQuery.length > 0 ? `WHERE ${filterQuery.join(" AND ")}` : ''}`)
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