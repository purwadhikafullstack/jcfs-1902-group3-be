const router = require('express').Router()
const {productController} = require('../controllers')

router.post('/', productController.addproduct)
router.patch('/:idproduct', productController.updateProduct)
router.patch('/image/:idimage', productController.updateImageProduct)

module.exports = router