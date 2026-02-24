const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  followUser,
  unfollowUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ================= PROTECTED ROUTES =================
router.get("/:id", authMiddleware, getUserProfile);

router.put("/follow/:id", authMiddleware, followUser);
router.put("/unfollow/:id", authMiddleware, unfollowUser);

module.exports = router;