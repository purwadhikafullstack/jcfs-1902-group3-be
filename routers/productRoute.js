const router = require('express').Router()
const {productController} = require('../controllers')

router.post('/', productController.addproduct)

module.exports = router