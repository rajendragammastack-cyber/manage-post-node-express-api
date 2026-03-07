const Comment = require('./comment.model');

exports.create = (data) => Comment.create(data);

exports.getByPost = (postId) =>
  Comment.find({ post: postId })
    .populate('user', 'name')
    .populate('likes', 'name')
    .sort({ createdAt: 1 })
    .lean();

exports.getOne = (id) => Comment.findById(id).populate('user', 'name').lean();

exports.like = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return null;
  if (comment.likes.some((id) => id.toString() === userId)) return comment;
  comment.likes.push(userId);
  await comment.save();
  return comment;
};

exports.unlike = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return null;
  comment.likes = comment.likes.filter((id) => id.toString() !== userId);
  await comment.save();
  return comment;
};

exports.remove = (id, userId) =>
  Comment.findOneAndDelete({ _id: id, user: userId });
