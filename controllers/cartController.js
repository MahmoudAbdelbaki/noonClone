const Cart = require('../models/cartSchema'); // Assuming the path to your Cart model is correct
const Product = require('../models/productSchema'); // Need Product model for validation

// --- Helper function to calculate subtotal (for demonstration, as pre-save hook should handle it) ---
const calculateSubtotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.amount), 0);
};

// =================================================================
// 1. GET /api/v1/cart - Get User Cart
// =================================================================
const getCart = async (req, res) => {
    // Find the cart belonging to the authenticated user.
    // We use findOne because we enforced 'unique: true' on the user field in the Cart schema.
    const cart = await Cart.findOne({ user: req.user.userId })
        // Optionally, populate the product details if needed, but the cart item already holds most info.
        // .populate('cartItems.product'); 

    if (!cart) {
        // Return an empty cart structure if none exists yet
        return res.status(200).json({ cartItems: [], subtotal: 0, msg: 'Cart is empty' });
    }

    res.status(200).json({ cart });
};

// =================================================================
// 2. POST /api/v1/cart - Add or Update Cart Item
// =================================================================
const addOrUpdateItem = async (req, res) => {
    const { productId, amount } = req.body;
    const userId = req.user.userId;

    if (!productId || !amount) {
        return res.status(400).json({ msg: 'Please provide productId and amount' });
    }
    
    // Ensure amount is a positive number
    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
        return res.status(400).json({ msg: 'Amount must be greater than zero' });
    }

    // 1. Find the product details for validation and item creation
    const product = await Product.findOne({ _id: productId });
    
    if (!product) {
        return res.status(404).json({ msg: `No product with id : ${productId}` });
    }

    // Check inventory
    if (product.inventory < numericAmount) {
        return res.status(400).json({ msg: `Only ${product.inventory} items available in stock` });
    }

    // 2. Prepare the new item data
    const newItem = {
        name: product.name,
        price: product.price,
        image: product.image,
        amount: numericAmount,
        product: product._id,
    };

    // 3. Find or Create the Cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        // Create a new cart if one doesn't exist
        cart = await Cart.create({
            user: userId,
            cartItems: [newItem],
            // subtotal will be calculated by pre('save') hook
        });
        return res.status(201).json({ cart });
    }

    // 4. Update existing cart
    const existingItemIndex = cart.cartItems.findIndex(
        (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        // Item exists: update the amount
        cart.cartItems[existingItemIndex].amount = numericAmount;
    } else {
        // Item does not exist: add new item to the array
        cart.cartItems.push(newItem);
    }
    
    // The pre('save') hook on the Cart schema will update the subtotal before saving
    await cart.save();
    
    res.status(200).json({ cart });
};

// =================================================================
// 3. DELETE /api/v1/cart/:itemId - Remove Single Item
// =================================================================
const removeItem = async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params; // This is the _id of the item within the cartItems array

    // Find the cart and use the $pull operator to remove the item from the array
    const cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { cartItems: { _id: itemId } } },
        { new: true } // Return the updated document
    );

    if (!cart) {
        return res.status(404).json({ msg: 'No cart found for user' });
    }

    // Manually update subtotal since $pull bypasses the pre('save') hook (for simplicity, we re-calculate)
    cart.subtotal = calculateSubtotal(cart.cartItems);
    await cart.save(); 

    res.status(200).json({ cart, msg: 'Item removed from cart' });
};

// =================================================================
// 4. PATCH /api/v1/cart/clear - Clear Cart
// =================================================================
const clearCart = async (req, res) => {
    const userId = req.user.userId;

    // Find the cart and update the cartItems array to be empty
    const cart = await Cart.findOneAndUpdate(
        { user: userId },
        { cartItems: [], subtotal: 0 }, // Clear items and set subtotal to 0
        { new: true }
    );

    if (!cart) {
        // If there's no cart to clear, it's still a successful clear operation from the user's perspective
        return res.status(200).json({ cartItems: [], subtotal: 0, msg: 'Cart was already empty' });
    }

    res.status(200).json({ cart, msg: 'Cart cleared successfully' });
};

module.exports = {
    getCart,
    addOrUpdateItem,
    removeItem,
    clearCart,
};