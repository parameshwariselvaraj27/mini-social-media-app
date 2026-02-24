const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...userData } = user._doc;

    res.json({ token, user: userData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET USER PROFILE =================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


 
 // ================= FOLLOW USER =================
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent following yourself
    if (userToFollow._id.equals(currentUser._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Prevent duplicate follow
    if (userToFollow.followers.includes(currentUser._id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    userToFollow.followers.push(currentUser._id);
    currentUser.following.push(userToFollow._id);

    await userToFollow.save();
    await currentUser.save();

    res.json({ message: "User followed successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UNFOLLOW USER =================
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    userToUnfollow.followers.pull(currentUser._id);
    currentUser.following.pull(userToUnfollow._id);

    await userToUnfollow.save();
    await currentUser.save();

    res.json({ message: "User unfollowed successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};