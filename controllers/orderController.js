const Order = require('../models/orderSchema');
const Product = require('../models/productSchema');
const { StatusCodes } = require('http-status-codes');

// 1. Create Order
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError('Please provide tax and shipping fee');
  }

  let orderItems = [];
  let subtotal = 0;

  // Iterate over cart items to verify details from DB
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with id : ${item.product}`);
    }

    const { name, price, image, _id } = dbProduct;
    
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // Add to list
    orderItems = [...orderItems, singleOrderItem];
    
    // Calculate subtotal
    subtotal += item.amount * price;
  }

  // Calculate Total
  const total = tax + shippingFee + subtotal;

  // Simulate payment intent creation (e.g., Stripe)
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'egp',
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
};

// 2. Get All Orders (Admin)
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

// 3. Get Single Order
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }

  checkPermissions(req.user, order.user); 

  res.status(StatusCodes.OK).json({ order });
};

// 4. Get Current User Orders
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

// 5. Update Order (e.g., Payment Status)
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

// Helper for fake stripe
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'some_random_secret_value';
  return { client_secret, amount };
};
const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError('Not authorized to access this route');
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};