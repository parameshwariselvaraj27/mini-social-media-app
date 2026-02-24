const Comment = require("../models/Comment");
const Post = require("../models/Post");


// ✅ CREATE COMMENT
exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const newComment = await Comment.create({
      text: text.trim(),
      user: req.user.id,
      post: postId,
    });

    // Add comment reference to post
    post.comments.push(newComment._id);
    await post.save();

    // Populate user before sending response
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "username");

    res.status(201).json(populatedComment);

  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ✅ DELETE COMMENT (OWNER ONLY)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only comment owner can delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove comment reference from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    // Delete comment
    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};