const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { body } = require('express-validator');

//Middlewares
const isAuth = require('../middlewares/isAuth.middleware');


//all the routes will get /admin prefix

// All Routes for Admin --> GET
router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getAllProductsAdmin);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// All Routes for Admin --> POST
router.post('/add-product', [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 10, max: 800 }).trim()
], isAuth, adminController.createAProduct);
router.post('/edit-product', [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 10, max: 800 }).trim()
], isAuth, adminController.postEditProducts);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;