const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { authenticateUser } = require("../middleware/auth"); // Ensure only logged-in users can access


// GET /users/:id - Get user profile
 
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Ensure user can only fetch their own profile (unless admin)
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "name", "phone_number", "role"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /users/:id - Update user profile
 */
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, phone_number } = req.body;
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.phone_number = phone_number || user.phone_number;
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
