const express = require('express');
const { getWallet, addMoney } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);

router.get('/', getWallet);
router.post('/add', addMoney);

module.exports = router;