const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  requestMoney,
  getAllRequests,
  acceptRequest,
  denyRequest,
} = require("../controllers/requestController");

router.use(protect);

router.post("/create-request", requestMoney);
router.get("/all-requests", getAllRequests);
router.put("/:id/accept", acceptRequest);
router.put("/:id/deny", denyRequest);

module.exports = router;
