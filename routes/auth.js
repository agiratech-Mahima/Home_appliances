
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models");
const { authenticateTokenOptional } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { userRegisterSchema } = require("../validators/userRegisterSchema");
const { userLoginSchema } = require("../validators/userLoginSchema");


const SECRET = process.env.JWT_SECRET || "dev_secret_fallback";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

//register
router.get("/register", authenticateTokenOptional, (req, res) => {
  res.render("register", {
    error: null,
    user: req.user || null,
    recent: [],
    orders: [],
  });
});

//login
router.get("/login", (req, res) => {
  const msg = req.query.msg || null;
  res.render("login", { error: null, msg });
});



router.post("/register",validate(userRegisterSchema), async (req, res) => {
  const { username, name, phone_number, email, password } = req.body;

  try {
    if (!username || !name || !phone_number || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      name,
      phone_number,
      email,
      password: hashedPassword,
      role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login",validate(userLoginSchema), async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.render("login", { error: "Invalid username or password", msg: null });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render("login", { error: "Invalid username or password", msg: null });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    console.log(token);

    const redirectTo = req.query.returnUrl || (user.role === "admin" ? "/admin" : "/main");
    return res.redirect(redirectTo);
  } catch (err) {
    console.error("Login Error:", err);
    res.render("login", { error: "Login failed", msg: null });
  }
});

/* --------------------------------------------------
 * GET /auth/logout
 * Clears token
 * ------------------------------------------------- */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/home");
});

module.exports = router;
