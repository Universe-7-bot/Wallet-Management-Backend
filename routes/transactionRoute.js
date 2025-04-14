const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { transferMoney, getTransactions } = require("../controllers/transactionController");

router.use(protect);

router.post("/transfer", transferMoney);
router.get("/allTrasactions", getTransactions);

module.exports = router;