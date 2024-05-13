const express = require("express");

const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");

const {
  login,
  logout,
  register,
  verifyEmail,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);
router.post("/verify-email", verifyEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
