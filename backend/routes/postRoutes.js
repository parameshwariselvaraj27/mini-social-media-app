const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  likePost,
} = require("../controllers/postController");

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getPosts);
router.put("/like/:id", authMiddleware, likePost);

module.exports = router;