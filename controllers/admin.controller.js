// test credintials 
const fs = require('fs');
//Models
const ProductModel = require('../models/product.model');
const { validationResult } = require('express-validator');

//utilities 
const errorHandler = require('../utilities/error.util');
const path = require('path');

//main controllers
module.exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    docTitle: 'Add a product',
    path: '/admin/add-product',
    editingMode: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};
module.exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  ProductModel.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      } else {
        res.render('admin/edit-product', {
          editingMode: editMode,
          docTitle: 'Edit Product',
          prod: product,
          path: '/edit-product',
          hasError: false,
          errorMessage: null,
          validationErrors: [],
        });
      }
    })
    .catch((err) => errorHandler.handle500(err, next));
};

module.exports.postEditProducts = (req, res, next) => {
  const { title, price, description, productId } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('admin/edit-product', {
      editingMode: true,
      docTitle: 'Edit Product',
      prod: {
        title,

        price,
        description,
        _id: productId
      },
      hasError: true,
      path: '/edit-product',
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  ProductModel.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        product.imageUrl = image.path;
      };
      return product.save()
        .then(() => {
          res.redirect('/admin/products');
          console.log('UPDATED PRODUCT');
        })
    })
    .catch((err) => {
      errorHandler.handle500(err, next);
    })
};

//creating a product via this controller function
module.exports.createAProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      editingMode: false,
      docTitle: 'Add Product',
      prod: {
        title,
        price,
        description
      },
      hasError: true,
      path: '/edit-product',
      errorMessage: 'Attached file is not an image',
      validationErrors: []
    });
  }


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('admin/edit-product', {
      editingMode: false,
      docTitle: 'Add Product',
      prod: {
        title,
        image,
        price,
        description
      },
      hasError: true,
      path: '/edit-product',
      errorMessage: errors.array()[0].msg,
      validationErrors: []
    });
  }
  const imageUrl = image.path;
  const product = new ProductModel({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log('Product Created');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      errorHandler.handle500(err, next);
    });
};

//Getting all admin products
module.exports.getAllProductsAdmin = (req, res, next) => {
  ProductModel.find({ userId: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        docTitle: `Admin Products`,
        prods: products,
        path: '/admin/products',
      });
    })
    .catch((err) => {
      errorHandler.handle500(err, next);
    })
};

module.exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  ProductModel.findById(prodId)
    .then(product => {
      ProductModel.deleteOne({ _id: prodId, userId: req.user._id })
        .then((result) => {
          const filePath = path.join(process.mainModule.path, product.imageUrl);
          fs.unlink(filePath, err => {
            if (err) {
              console.log(err)
            }
          })
          res.redirect('/admin/products');
          console.log('DELETED !!');
        })
        .catch((err) => {
          errorHandler.handle500(err, next);
        })
    });
};
