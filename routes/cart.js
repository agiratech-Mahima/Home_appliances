
const express = require("express");
const router = express.Router();
const { Product } = require("../models");
const { authenticateTokenOptional } = require("../middleware/auth");

// Middleware: require login
function requireLoginRedirect(req, res, next) {
  const user = req.user || req.session.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Please login to add items to cart",
      redirect: "/auth/login?returnUrl=/main"
    });
  }
  next();
}

// Attach user if token is available
router.use(authenticateTokenOptional);

// Ensure session cart
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
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url || "https://via.placeholder.com/150",
        quantity: 1
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
  res.render("cart", { cart: req.session.cart, user: req.user || req.session.user });
});

// Remove product
router.post("/remove/:id", requireLoginRedirect, (req, res) => {
  const productId = Number(req.params.id);
  req.session.cart = req.session.cart.filter(i => i.id !== productId);
  res.redirect("/cart");
});



module.exports = router;
