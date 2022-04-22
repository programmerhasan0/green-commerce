const express = require('express');
const router = express.Router();

//middlewares
const isAuth = require('../middlewares/isAuth.middleware');

const shopController = require('../controllers/shop.controller');

//All Routes For Shop --> GET
router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/product/:productId', shopController.getProduct);
router.get('/cart', isAuth, shopController.getCart);
// router.get('/checkout', shopController.getCheckout);
router.get('/orders', shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

//All Routes for Shop --> POST
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.post('/create-order', isAuth, shopController.postOrder);



module.exports = router;