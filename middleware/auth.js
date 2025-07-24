
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const SECRET = process.env.JWT_SECRET || "dev_secret_fallback";

// Helper to extract token
function getToken(req) {
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader && authHeader.split(" ")[1];
  return tokenFromHeader || req.cookies?.token || null;
}

// Require authentication (user OR admin)
function authenticateToken(req, res, next) {
  const token = getToken(req);
  if (!token) return res.redirect("/auth/login?msg=login_required");

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.redirect("/auth/login?msg=session_expired");
    req.user = user; // { id, role }
    next();
  });
}

 //Optional authentication (guest access)
function authenticateTokenOptional(req, res, next) {
     
  const token = getToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, SECRET, (err, user) => {
    req.user = err ? null : user;
    next();
  });
}

// Role-based authorization
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
}

// Admin-only middleware
function authenticateAdmin(req, res, next) {
  const token = getToken(req);
  if (!token) return res.redirect("/auth/login?msg=login_required");

  jwt.verify(token, SECRET, (err, user) => {
    if (err || user.role !== "admin") return res.status(403).send("Access denied. Admin only.");
    req.user = user;
    next();
  });
}

// User-only middleware
function authenticateUser(req, res, next) {
  const token = getToken(req);
  if (!token) return res.redirect("/auth/login?msg=login_required");

  jwt.verify(token, SECRET, (err, user) => {
    if (err || user.role !== "user") return res.status(403).send("Access denied. Users only.");
    req.user = user;
    next();
  });
}

module.exports = { 
  authenticateToken, 
  authenticateTokenOptional, 
  authorizeRoles, 
  authenticateAdmin,
  authenticateUser 
};
