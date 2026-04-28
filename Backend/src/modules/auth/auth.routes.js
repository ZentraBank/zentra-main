const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();
const validate = require("../../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("./auth.validation");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authMiddleware, authController.logout);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;