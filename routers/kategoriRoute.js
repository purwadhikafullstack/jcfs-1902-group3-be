const router = require('express').Router()
const {kategoriController} = require('../controllers')

router.get('/', kategoriController.getkategori)

module.exports = router