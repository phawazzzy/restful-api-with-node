const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');



router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name price')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        link: {
                            type: 'GET',
                            url: `http://localhost:3000/orders/${doc._id}`
                        }
                    }

                })


            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'product not found'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            })
            return order.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "your order has been saved",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                link: {
                    type: 'GET',
                    url: `http://localhost:3000/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                // message: 'product not found',
                error: err
            })
        })
});


router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('product quantity _id')
        .populate("product", "name price")
        .exec()
        .then(order => {
            if (!order) {
                return res.status(200).json({
                    message: "Order not found"
                })
            }
            res.status(200).json({
                    order: order,
                    link: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders'
                    }

                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })
        })
});

router.delete('/:orderId', (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "order has been deleted",
                link: {
                    type: "POST",
                    url: "http://localhost:3000/orders",
                    body: { productId: "ID", quantity: "Number" }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});


module.exports = router