const express = require("express");
const {
  register,
  login,
  me,
  logout,
} = require("./auth.controller");

const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);

module.exports = router;