const router = require('express').Router()
const {materialController} = require('../controllers')

router.get('/', materialController.getMaterial)

module.exports = router