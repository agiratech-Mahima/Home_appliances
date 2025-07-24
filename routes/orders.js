const express = require("express");
const router = express.Router();
const { Product, Order } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// Show main page with products and user orders
router.get("/", authenticateUser, async (req, res) => {
  try {
    const products = await Product.findAll();

    // If user is logged in, fetch their orders
    const orders = req.user
      ? await Order.findAll({ where: { user_id: req.user.id } })
      : [];

    res.render("main", {
      user: req.user,
      products,
      orders: orders || [],
      cart: req.session.cart || []
    });
  } catch (err) {
    console.error("Error in main route:", err);
    res.status(500).send("Error loading page");
  }
});




// Cancel an order
router.put("/cancel/:id", authenticateUser, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check permission
    if (req.user.role !== "admin" && req.user.id !== order.user_id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Prevent cancel if delivered/canceled
    if (order.status === "delivered" || order.status === "canceled") {
      return res.status(400).json({
        success: false,
        message: "Delivered or already canceled orders cannot be canceled.",
      });
    }

    order.status = "canceled";
    await order.save();
    res.json({ success: true, message: "Order canceled successfully" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
