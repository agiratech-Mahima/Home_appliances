const express = require("express");
const router = express.Router();
const { Product, Order, ViewedProduct } = require("../models");
const { authenticateTokenOptional } = require("../middleware/auth");

// Landing Page with Products
router.get("/", authenticateTokenOptional, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const products = await Product.findAll({ limit, offset });

    
    let recent = [];

   

    if (req.user && req.user.role === "user") {
      recent = await ViewedProduct.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Product }],
        order: [["viewed_at", "DESC"]],
        limit: 5
      });
    }

    res.render("home", { 
      products, 
      user: req.user || null, 
      recent, 
      cart: req.session.cart || [] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading home page");
  }
});

module.exports = router;




