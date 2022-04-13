const router = require('express').Router()
const {adminController} = require('../controllers')
const { readToken } = require("../supports/enkripsi");

router.get(`/getwarehouse`, adminController.getWarehouse);
router.get(`/getadmin`, adminController.getAdmin);
router.post(`/addwarehouse`, readToken, adminController.addWarehouse);
router.post(`/addadmin`, adminController.addAdmin);

module.exports = router