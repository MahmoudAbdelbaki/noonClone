const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const auth = require('./routes/auth');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const path = require('path');

// // Load environment variables
dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));




app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api/products', productRouter);
app.use('/api/auth', auth);
app.use('/api/orders', orderRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
