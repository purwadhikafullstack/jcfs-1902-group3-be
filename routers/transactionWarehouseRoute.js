const router = require('express').Router()
const { transactionWarehouseController } = require('../controllers')
const { readToken } = require('../supports/enkripsi')

router.post('/addcartadmin', readToken, transactionWarehouseController.addCartAdmin)
router.get('/getcartadmin', readToken, transactionWarehouseController.getCartAdmin)
router.get('/getwarehouseadmin', readToken, transactionWarehouseController.getWarehouseAdmin)
router.post('/checkoutadmin', readToken, transactionWarehouseController.checkoutAdmin)

module.exports = router