const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { Product, Order, ViewedProduct } = require("../models");

// Main page for logged-in users
router.get("/", authenticateToken, async (req, res) => {
  const sort = req.query.sort;
  let order = [];

  if (sort === "price-asc") order = [["price", "ASC"]];
  else if (sort === "price-desc") order = [["price", "DESC"]];
  else if (sort === "name-asc") order = [["name", "ASC"]];
  else if (sort === "name-desc") order = [["name", "DESC"]];

  try {
    // Fetch products
    const products = await Product.findAll({ order });

    // Fetch orders for the logged-in user
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    // Fetch recently viewed products (limit 3)
    const recentViews = await ViewedProduct.findAll({
      where: { user_id: req.user.id },
      include: [Product],
      order: [["viewed_at", "DESC"]],
      limit: 3,
    });

    res.render("main", { 
      user: req.user, 
      products, 
      cart: req.session.cart || [], 
      orders,
      recentViews,
    });
  } catch (err) {
    console.error("Error loading main page:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;










