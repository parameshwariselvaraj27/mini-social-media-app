const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createComment,
  deleteComment
} = require("../controllers/commentController");


// ✅ CREATE COMMENT
// POST /api/comments/:postId
router.post("/:postId", authMiddleware, createComment);


// ✅ DELETE COMMENT
// DELETE /api/comments/:commentId
router.delete("/:commentId", authMiddleware, deleteComment);


module.exports = router;