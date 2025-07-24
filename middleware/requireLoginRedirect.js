// middleware/requireLoginRedirect.js
module.exports = function requireLoginRedirect(req, res, next) {
  if (req.user) return next(); // If logged in, continue

  // Save the original URL in session for post-login redirect
  req.session.returnTo = req.originalUrl;

  // Redirect to login page with optional message
  return res.redirect("/auth/login?msg=login_required");
};
