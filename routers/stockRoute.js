const router = require('express').Router()
const {stockController} = require('../controllers')

router.get('/', stockController.getStockWarehouse)

module.exports = router