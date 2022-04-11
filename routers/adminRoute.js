const router = require('express').Router()
const {adminController} = require('../controllers')
const { readToken } = require("../supports/enkripsi");

router.get(`/getwarehouse`, adminController.getWarehouse);
router.post(`/addwarehouse`, readToken, adminController.addWarehouse);

module.exports = router