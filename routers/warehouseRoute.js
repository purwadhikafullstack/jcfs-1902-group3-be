const router = require('express').Router()
const {warehouseController} = require('../controllers')

router.get('/', warehouseController.getWarehouse)

module.exports = router