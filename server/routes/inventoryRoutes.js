const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const {
  getItems,
  createItem,
  updateItem,
  updateQuantity,
  deleteItem,
} = require("../controllers/inventoryController");

router.use(protect, restrictTo("admin", "staff"));

router.get("/", getItems);
router.post("/", createItem);
router.put("/:id", updateItem);
router.patch("/:id/quantity", updateQuantity);
router.delete("/:id", deleteItem);

module.exports = router;
