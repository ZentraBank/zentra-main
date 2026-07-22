const express = require("express");

const tenantController = require("./tenant.controller");

const {
  resolveTenantMiddleware,
} = require("../../middleware/tenant.middleware");

const router = express.Router();

router.get(
  "/current",
  resolveTenantMiddleware,
  tenantController.getCurrentTenant
);

module.exports = router;