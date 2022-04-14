const router = require('express').Router()
const {adminController} = require('../controllers')
const { readToken } = require("../supports/enkripsi");

router.get(`/getwarehouse`, adminController.getWarehouse);
router.post(`/addwarehouse`, readToken, adminController.addWarehouse);
router.patch(`/updatewarehouse/:idwarehouse`,readToken, adminController.updateWarehouse);
router.delete(`/deletewarehouse/:idwarehouse`,readToken, adminController.deleteWarehouse);

router.get(`/getadmin`, adminController.getAdmin);
router.post(`/addadmin`, adminController.addAdmin);
router.patch(`/updateadmin/:iduser`,readToken, adminController.updateAdmin);
router.delete(`/deleteadmin/:iduser`,readToken, adminController.deleteAdmin);

module.exports = router