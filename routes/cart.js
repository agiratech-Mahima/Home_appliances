const express = require("express");
const router = express.Router();
const { Product } = require("../models");
const { authenticateTokenOptional } = require("../middleware/auth");
const requireLoginRedirect = require("../middleware/requireLoginRedirect");


// Attach user if token is available
router.use(authenticateTokenOptional);

router.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

// Add to cart
router.post("/add/:id", requireLoginRedirect, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cart = req.session.cart;
    const existing = cart.find(i => i.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        return res.status(400).json({ success: false, message: "Stock limit reached" });
      }
      existing.quantity += 1;
      existing.stock = product.stock;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url || "https://via.placeholder.com/150",
        quantity: 1,
        stock: product.stock
      });
    }

    const cartQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    return res.json({ success: true, cartCount: cartQty });
  } catch (err) {
    console.error("Add cart error:", err);
    return res.status(500).json({ success: false, message: "Error adding to cart" });
  }
});

// View cart
router.get("/", requireLoginRedirect, (req, res) => {
  res.render("cart", {
    cart: req.session.cart,
    user: req.user || req.session.user
  });
});

// Remove product
router.post("/remove/:id", requireLoginRedirect, (req, res) => {
  const productId = Number(req.params.id);
  req.session.cart = req.session.cart.filter(i => i.id !== productId);
  res.redirect("/cart");
});

// Increase quantity (AJAX)
router.post("/increase/:id", async (req, res) => {
  const cart = req.session.cart || [];
  const productId = parseInt(req.params.id);
  const product = await Product.findByPk(productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const item = cart.find(i => i.id === productId);
  if (item) {
    if (item.quantity < product.stock) {
      item.quantity += 1;
      item.stock = product.stock;
      req.session.cart = cart;
      return res.json({
        success: true,
        quantity: item.quantity,
        totalPrice: item.quantity * item.price
      });
    } else {
      return res.status(400).json({ error: "Stock limit reached" });
    }
  }

  return res.status(400).json({ error: "Item not in cart" });
});

// Decrease quantity (AJAX)
router.post("/decrease/:id", (req, res) => {
  const cart = req.session.cart || [];
  const productId = parseInt(req.params.id);

  const item = cart.find(i => i.id === productId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      req.session.cart = cart.filter(i => i.id !== productId);
    }
    return res.json({
      success: true,
      quantity: item.quantity || 0,
      totalPrice: item.quantity * item.price || 0
    });
  }

  return res.status(400).json({ error: "Item not in cart" });
});

module.exports = router;
