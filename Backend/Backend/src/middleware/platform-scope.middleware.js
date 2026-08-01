const requirePlatformScope = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  if (req.auth.scope !== "platform") {
    return res.status(403).json({
      message: "Platform-level access is required.",
    });
  }

  return next();
};

module.exports = { requirePlatformScope };
