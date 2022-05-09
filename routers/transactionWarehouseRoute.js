const router = require('express').Router()
const { transactionWarehouseController } = require('../controllers')
const { readToken } = require('../supports/enkripsi')

router.post('/addcartadmin', readToken, transactionWarehouseController.addCartAdmin)
router.get('/getcartadmin', readToken, transactionWarehouseController.getCartAdmin)
router.get('/getrequest', readToken, transactionWarehouseController.getRequest)
router.get('/outgoingrequest', readToken, transactionWarehouseController.outgoingRequest)
router.get('/getwarehouseadmin', readToken, transactionWarehouseController.getWarehouseAdmin)
router.post('/checkoutadmin', readToken, transactionWarehouseController.checkoutAdmin)
router.get('/', readToken, transactionWarehouseController.getProductAdmin)
router.patch('/konfirmasi/:idtransaksi_warehouse', readToken, transactionWarehouseController.konfirmasiRequest)
router.patch('/reject/:idtransaksi_warehouse', readToken, transactionWarehouseController.rejectRequest)

module.exports = router