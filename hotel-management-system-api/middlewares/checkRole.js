// middlewares/checkRole.js
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
function isAdminOrReceptionist(req, res, next) {
  if (!req.user || !["admin", "receptionist"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Insufficient role" });
  }
  next();
}
function isAdminReceptionistOrSelf(req, res, next) {
  const userId = parseInt(req.params.id);
  if (
    req.user.role === "admin" ||
    req.user.role === "receptionist" ||
    req.user.id === userId
  ) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
}
module.exports = { isAdminOrReceptionist, isAdminReceptionistOrSelf };
