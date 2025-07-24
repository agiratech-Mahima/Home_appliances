const express = require("express");
const router = express.Router();
const {
  Product,
  Order,
  OrderItem,
  OrderStatusHistory,
  User,
} = require("../models");
const { authenticateAdmin } = require("../middleware/auth");



router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.count(),
      Product.count(),
      Order.count(),
    ]);

    const salesAgg = await Order.findAll({
      attributes: [
        [Order.sequelize.fn("SUM", Order.sequelize.col("total_amount")), "sum"],
      ],
      raw: true,
    });
    const totalSales = parseFloat(salesAgg[0].sum || 0);

    const orders = await Order.findAll({
      include: [{ model: User, attributes: ["id", "username", "name", "email"] }],
      order: [["created_at", "DESC"]],
      limit: 20,
    });

    const recentOrders = orders.slice(0, 5);
    const products = await Product.findAll({ order: [["created_at", "DESC"]] });

    // ** Fetch all users for dashboard **
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const stats = { totalUsers, totalProducts, totalOrders, totalSales };

    res.render("adminDashboard", {
      user: req.user,
      stats,
      products,
      recentOrders,
      orders,
      users,  // Pass users list to EJS
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).send("Error loading admin dashboard");
  }
});


/**
 * Profile Routes
 */
router.get("/profile", authenticateAdmin, async (req, res) => {
  try {
    const adminRecord = await User.findByPk(req.user.id);
    res.render("admin/profile", { user: adminRecord || req.user, error: null });
  } catch (err) {
    console.error("Admin profile load error:", err);
    res.status(500).send("Error loading profile");
  }
});

router.post("/profile", authenticateAdmin, async (req, res) => {
  const { name, phone_number } = req.body;
  try {
    await User.update({ name, phone_number }, { where: { id: req.user.id } });
    res.redirect("/admin/profile");
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).send("Error updating profile");
  }
});

/**
 * Add Product
 */
router.post("/products/add", authenticateAdmin, async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  try {
    await Product.create({ name, description, price, stock, image_url });
    res.redirect("/admin");
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).send("Error adding product");
  }
});

//Update Product  
router.put("/products/:id", authenticateAdmin, async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  try {
    const [updated] = await Product.update(
      { name, description, price, stock, image_url },
      { where: { id: req.params.id } }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const product = await Product.findByPk(req.params.id);
    res.json({ success: true, product });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
});

/**
 * Delete Product (AJAX)
 */
router.delete("/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
});

//yet to do.....
router.post("/orders/update/:id", authenticateAdmin, async (req, res) => {
  const { new_status } = req.body;

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const old_status = order.status;
    await order.update({ status: new_status });

    await OrderStatusHistory.create({
      order_id: order.id,
      old_status,
      new_status,
      changed_by: req.user.id,
      changed_at: new Date(),
    });

    if (new_status === "canceled") {
      const items = await OrderItem.findAll({ where: { order_id: order.id } });
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          await product.update({ stock: product.stock + item.quantity });
        }
      }
    }

    res.redirect("/admin");
  } catch (err) {
    console.error("Order update error:", err);
    res.status(500).send("Error updating order");
  }
});

module.exports = router;
