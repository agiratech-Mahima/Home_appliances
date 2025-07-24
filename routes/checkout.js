const express = require("express");
const router = express.Router();
const { Order, OrderItem, Product } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// Show Checkout Page (GET)
router.get("/", authenticateUser, (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.redirect("/cart?msg=empty_cart");
  }

  // Calculate total
  const total_amount = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  res.render("checkout", { cart, user: req.user, total_amount });
});

//  Place Order (POST)
router.post("/", authenticateUser, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const payment_method = "COD"; // Only Cash on Delivery allowed

    // Calculate total and check stock
    let totalAmount = 0;
    for (const item of cart) {
      const product = await Product.findByPk(item.id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `${item.name} is out of stock` });
      }
      totalAmount += product.price * item.quantity;
    }

    // Create Order
    const order = await Order.create({
      user_id: req.user.id,
      total_amount: totalAmount,
      payment_method,
      status: "pending",
    });

    // Add Order Items & Update Stock
    for (const item of cart) {
      const product = await Product.findByPk(item.id);
      await OrderItem.create({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: product.price,
      });
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear cart after successful order
    req.session.cart = [];

    res.render("orderSuccess", { orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing order");
  }
});

module.exports = router;
