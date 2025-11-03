//Models
const ProductModel = require("../models/product.model");
const OrderModel = require("../models/order.model");
const fs = require("fs");
const path = require("path");

//utilities
const errorHandler = require("../utilities/error.util");

module.exports.getProducts = (req, res, next) => {
    ProductModel.find()
        .then(products => {
            res.render("shop/product-list", {
                docTitle: "Welcome to the shop",
                prods: products,
                path: "/products",
            });
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    ProductModel.findById(prodId).then(product => {
        res.render("shop/product-detail", {
            docTitle: `Details of ${product.title}`,
            prod: product,
            path: "/products",
        });
    });
};

module.exports.getIndex = (req, res, next) => {
    ProductModel.find()
        .then(result => {
            res.render("shop/index", {
                docTitle: "Welcome to the shop",
                prods: result,
                path: "/",
            });
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect("/cart");
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.getCart = (req, res, next) => {
    console.log(req.user);
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            console.log(user.cart.items);
            //user.cart.items --> has cart items;
            res.render("shop/cart", {
                docTitle: "This is Cart",
                path: "/cart",
                products: user.cart.items,
            });
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.postCart = (req, res, next) => {
    const prodId = req.body.prodId;
    ProductModel.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect("/cart");
        })
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.postOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity,
                    product: { ...i.productId._doc },
                };
            });
            const order = new OrderModel({
                user: {
                    email: req.user.email,
                    userId: req.user._id,
                },
                products: products,
            });
            return order.save();
        })
        .then(result => req.user.clearCart())
        .then(() => res.redirect("/orders"))
        .catch(err => {
            errorHandler.handle500(err, next);
        });
};

module.exports.getOrders = (req, res, next) => {
    OrderModel.find({ "user.userId": req.user._id }).then(orders => {
        res.render("shop/orders", {
            path: "/orders",
            docTitle: "Your Orders",
            orders: orders,
        });
    });
};

module.exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        docTitle: "Make Your Payment",
        path: "/checkout",
    });
};

module.exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = `invoice_${orderId}.pdf`;
    const inlvoicePath = path.join("invoices", invoiceName);
    console.log(inlvoicePath);
    fs.readFile(inlvoicePath, (err, data) => {
        if (err) {
            return next();
        }
        res.setHeader("Content-Type", "application/pdf");
        res.send(data);
    });
};
