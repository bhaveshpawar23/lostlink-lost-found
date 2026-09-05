const express = require("express");

const {
  createItem,
  getItems,
  getReturnedItems,
  getItemById,
  updatedItem,
  deletedItem,
} = require("../controllers/itemController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getItems);

router.get("/returned", getReturnedItems);

router.get("/:id", getItemById);

router.post("/", protect, createItem);

router.put("/:id", protect, updatedItem);

router.delete("/:id", protect, deletedItem);

module.exports = router;
