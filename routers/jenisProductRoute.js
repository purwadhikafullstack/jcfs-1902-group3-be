const router = require('express').Router()
const {jenisProductController} = require('../controllers')

router.get('/', jenisProductController.getJenisProduct)

module.exports = router