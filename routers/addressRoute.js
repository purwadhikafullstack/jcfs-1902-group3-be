const router = require('express').Router()
const {addressController} = require('../controllers')

router.get('/provinsi', addressController.getProvinsi )
router.get('/kota/:idProvinsi', addressController.getKota )

module.exports = router