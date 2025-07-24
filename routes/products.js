const express = require("express");
const router = express.Router();
const { Product, ViewedProduct } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// GET /products/:id - Show product detail & record a view
router.get("/:id", authenticateUser, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id; // set by authenticateUser middleware

    // Record the view (no await blocking page load if you prefer; see note below)
    await ViewedProduct.create({
      user_id: userId,
      product_id: productId,
      viewed_at: new Date(),
    });

    // Fetch product details
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).render("404", { message: "Product not found" });
    }

    res.render("product_detail", { product });
  } catch (err) {
    next(err);
  }
});


//recent products 3


router.get("/recent/views", authenticateUser, async (req, res, next) => {
  try {
    // Grab a chunk (newest first) so we can dedupe properly
    const views = await ViewedProduct.findAll({
      where: { user_id: req.user.id },
      include: [Product],
      order: [["viewed_at", "DESC"]],
      limit: 20,  // fetch extra in case of repeats
    });

    const uniqueViews = [...new Map(views.map(v => [v.product_id, v])).values()]
      .slice(0, 3); 

    res.render("recentlyViewed", { recentViews: uniqueViews });
  } catch (err) {
    next(err);
  }
});






module.exports = router;
