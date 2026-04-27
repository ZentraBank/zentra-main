const express = require("express");
const router = express.Router();

const tenantController = require("./tenant.controller");

// public
router.get("/current", tenantController.getCurrentTenant);

// later: protect this with super_admin
router.post("/", tenantController.createTenant);

module.exports = router;