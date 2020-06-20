const express = require('express');
const app = express();
//Package for logging details
const morgan = require('morgan');
const bodyParser = require('body-parser');
//Connection to MongoDB
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

mongoose.connect("mongodb+srv://Nacho:" + process.env.MONGO_ATLAS_PW + "@node-rest-shop-0dywe.mongodb.net/node-rest-shop-shard?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //Silence DeprecationWarning: collection.ensureIndex is deprecated
        useCreateIndex: true
    });
mongoose.Promise = global.Promise;

//This tells express to log via morgan
//and morgan to log in the "dev" format
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS Errors preventio
app.use((req, res, next) => {
    res.header("Access.Control-Allow-Origin", "*"),
        res.header("Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methids", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    const error = new Error("Request not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;