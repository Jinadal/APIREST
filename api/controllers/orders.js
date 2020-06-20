const Order = require('../models/orders');
const Product = require('../models/products');

const mongoose = require('mongoose');

exports.orders_get_all =  (req, res, next) => {
    Order
        .find()
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc.id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}

exports.orders_post_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json();
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order
                .save()
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Order stored",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Product not found"
            });
        })
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if (order) {
                res.status(200).json({
                    product: order,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/'
                    }
                });
            }
            else {
                res.status(404).json({ message: "No valid entry found for provided ID" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}

exports.orders_delete_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: "POST",
                    url: "http://localhost:3000/orders",
                    body: { productId: 'ID', quantity: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err: error });
        });
}