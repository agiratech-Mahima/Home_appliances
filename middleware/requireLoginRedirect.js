
module.exports = function requireLoginRedirect(req, res, next) {
  if (req.user) return next(); 
  req.session.returnTo = req.originalUrl;
  return res.redirect("/auth/login?msg=login_required");
};
