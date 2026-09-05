const express = require("express");

const {
  createFoundResponse,
  getMyFoundResponses,
  getMySubmittedFoundResponses,
  updateFoundResponseStatus,
} = require("../controllers/foundResponseController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

router.post("/", protect, upload.single("image"), createFoundResponse);
router.get("/my", protect, getMyFoundResponses);
router.get("/my-submissions", protect, getMySubmittedFoundResponses);
router.patch("/:id/status", protect, updateFoundResponseStatus);

module.exports = router;
