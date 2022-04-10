const router = require('express').Router()
const {productController} = require('../controllers')
const { readToken } = require('../supports/enkripsi')

router.get('/', productController.getProduct)
router.post('/', readToken, productController.addproduct)
router.patch('/:idproduct', readToken, productController.updateProduct)
router.patch('/image/:idimage', readToken, productController.updateImageProduct)
router.delete('/:idproduct', readToken, productController.softDelete)
module.exports = router