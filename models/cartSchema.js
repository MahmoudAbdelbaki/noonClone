const mongoose = require('mongoose');

// --- Single Cart Item Schema (Reuses the structure from SingleOrderItemSchema) ---
// Note: This ensures consistency between what is in the cart and what ends up in an order.
const SingleCartItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true }, // The quantity of this item
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
});

// --- Main Cart Schema ---
const cartSchema = new mongoose.Schema(
  {
    // Items currently in the cart
    cartItems: [SingleCartItemSchema],

    // The user who owns this cart
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // A user should only have one active cart document
    },
    
    // Total price of all items * quantities (Subtotal before tax/shipping)
    // This can be calculated on the fly, but storing it here can optimize reads.
    subtotal: {
        type: Number,
        required: true,
        default: 0,
    },
  },
  // Add timestamps for tracking when the cart was created or last updated
  { timestamps: true }
);

// Optional: You might want a pre-save hook to ensure the subtotal is always accurate
cartSchema.pre('save', function(next) {
    // Calculate the total subtotal from all items in the cartItems array
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.price * item.amount), 0);
});

module.exports = mongoose.model('Cart', cartSchema);