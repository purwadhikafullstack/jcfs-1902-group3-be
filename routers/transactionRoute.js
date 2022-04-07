const router = require('express').Router()
const {transactionController} = require('../controllers')

router.post('/carts', transactionController.addCart)
router.patch('/carts/:idcart', transactionController.updateQtyCart)
router.get('/carts', transactionController.getCart)
router.delete('/carts/:idcart', transactionController.deleteCart)

module.exports = router