const Product = require('../models/productSchema');

const createProduct = async (req, res) => {
    // 1. Attach the user (admin) who is creating the product
    req.body.user = req.user.userId;

    // 2. Create the product
    const product = await Product.create(req.body);

    // 3. Send response
    res.status(201).json({ product });
};

const getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.status(200).json({ products, count: products.length });
};

module.exports = {
    createProduct,
    getAllProducts,
};