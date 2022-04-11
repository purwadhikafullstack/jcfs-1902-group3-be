const router = require(`express`).Router();
const { usersController } = require(`../controllers`);
const { readToken } = require("../supports/enkripsi");

router.get(`/`, usersController.getData);
router.patch(`/profile`, usersController.inputDataUser);
router.patch(`/updatephoto`, readToken, usersController.updateImageProfile);
router.post(`/forgotpassword`, usersController.forgotpassword);
router.post(`/newpassword`, readToken, usersController.newpassword);
router.post(`/register`, usersController.register);
router.post(`/login`, usersController.login);
router.get(`/verify`, readToken, usersController.verification);
router.get(`/keeplogin`, readToken, usersController.keepLogin);
router.patch(`/updatenama`, readToken, usersController.editNama);
router.patch(`/updateumur`, readToken, usersController.editUmur);
router.patch(`/updategender`, readToken, usersController.editGender);
router.patch(`/updatephone`, readToken, usersController.editPhone);
router.get(`/getaddress`, readToken, usersController.getAddress);
router.post(`/addaddress`, readToken, usersController.addAddress);
router.patch(`/editaddress/:idaddress`, readToken, usersController.editAddress);
router.delete(`/deleteaddress/:idaddress`, readToken, usersController.deleteAddress);
router.patch(`/chooseaddress/:idaddress`, readToken, usersController.chooseAddress);

module.exports = router