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

const getProduct = async (req, res) => {
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
        return res.status(404).json({ msg: `No product with id: ${productId}` });
    }

    res.status(200).json({ product });
};

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;

    // { new: true } returns the updated document instead of the original one
    // { runValidators: true } ensures Mongoose schema validators are run on udate
    const product = await Product.findOneAndUpdate(
        { _id: productId },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!product) {
        return res.status(404).json({ msg: `No product with id: ${productId}` });
    }

    // 4. Send response
    res.status(200).json({ product });
};

const deleteProduct = async (req, res) => {

    const { id: productId } = req.params;

    const product = await Product.findOneAndDelete({ _id: productId });

    if (!product) {
        return res.status(404).json({ msg: `No product with id: ${productId}` });
    }
    res.status(200).json({ msg: 'Success! Product removed.', product });
};

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,    
    updateProduct,
    deleteProduct,  
};