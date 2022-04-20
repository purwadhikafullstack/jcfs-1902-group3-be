const usersController = require(`./usersController`);
const productController = require('./productController')
const kategoriController = require('./kategoriController')
const materialController = require('./materialController')
const jenisProductController = require('./jenisProductController')
const stockController = require('./stockController')
const transactionController = require('./transactionController')
const addressController = require('./addressController')
const adminController = require('./adminController')
const warehouseController = require('./warehouseController');
const transactionWarehouseController = require('./transactionWarehouseController');

module.exports = {
    usersController,
    productController,
    kategoriController,
    materialController,
    jenisProductController,
    stockController,
    transactionController,
    addressController,
    adminController,
    warehouseController,
    transactionWarehouseController
}