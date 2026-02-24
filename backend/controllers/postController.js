const Post = require("../models/Post");

// Create Post
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user.id,
      content: req.body.content,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username"
        }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
// Like Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }

    res.json({ message: "Post liked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};