const express = require("express");
const {
  register,
  login,
  logout,
  update,
  getUsers,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/users", protect, getUsers);
router.post("/register", register);
router.post("/login", login);
router.put("/update", protect, update);
router.post("/logout", protect, logout);

module.exports = router;
