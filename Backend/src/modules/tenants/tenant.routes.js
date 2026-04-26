const express = require("express");
const {
  getCurrentTenant,
  createTenant,
} = require("./tenant.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const allowRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.get("/current", getCurrentTenant);

// Only super_admin should create new tenants later
router.post(
  "/",
  authMiddleware,
  allowRoles("super_admin"),
  createTenant
);

module.exports = router;