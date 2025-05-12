const express = require("express");
const {
  getBalanceTrend,
  getMonthlyActivity,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(protect);

router.get("/balance-trend", getBalanceTrend);
router.get("/monthly-activity", getMonthlyActivity);

module.exports = router;
