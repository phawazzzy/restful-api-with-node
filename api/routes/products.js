const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/../uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname)
    }
});

const checkFileType = (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(null, false)
        }
    }
    // const upload = multer({ dest: "uploads/" })
const upload = multer({
    dest: "uploads/",
    // storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5

    },
    fileFilter: checkFileType
});




const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                    count: docs.length,
                    products: docs.map(doc => {
                        return {
                            name: doc.name,
                            price: doc.price,
                            _id: doc._id,
                            image: doc.productImage,
                            link: {
                                type: "GET",
                                url: "http://localhost:3000/products/" + doc._id,

                            }
                        }
                    })
                }
                // if (docs.length >= 0) {
            res.status(200).json(response);
            // } else { 
            //     res.status(404).json({
            //         message: "no product found"
            //     })
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', upload.single('productImage'), checkAuth, (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        // productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Product has been created succesfully",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    // image: req.file.path,
                    link: {
                        type: "GET",
                        url: "http://localhost:3000/products/" + result._id,

                    }
                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });

});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("from database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    link: {
                        type: 'GET',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid entry for the product provided"
                })
            }
            res.status(200).json(doc)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'product updated',
                link: {
                    type: 'GET',
                    url: "http://localhost:3000/products/" + id,

                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.deleteOne({ _id: id }).exec().then(result => {
            res.status(200).json({
                message: 'product deleted',
                link: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    body: {
                        name: "String",
                        price: "Number"
                    }
                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})
module.exports = router;