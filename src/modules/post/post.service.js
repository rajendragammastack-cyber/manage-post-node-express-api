const Post = require('./post.model');
const Comment = require('../comment/comment.model');

exports.create = (data) => Post.create(data);

exports.getAll = (userId) => Post.find({ user: userId });

exports.getOne = (id, userId) => Post.findOne({ _id: id, user: userId });

exports.getById = (id) =>
  Post.findById(id).populate('user', 'name').lean();

exports.update = (id, userId, data) =>
  Post.findOneAndUpdate({ _id: id, user: userId }, data, { new: true });

exports.remove = (id, userId) =>
  Post.findOneAndDelete({ _id: id, user: userId });

exports.getFeed = async (userId) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name')
    .lean();
  const commentCounts = await Comment.aggregate([
    { $group: { _id: '$post', count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(commentCounts.map((c) => [c._id.toString(), c.count]));
  return posts.map((p) => ({
    ...p,
    likeCount: (p.likes || []).length,
    userLiked: (p.likes || []).some((id) => id.toString() === userId),
    commentCount: countMap[p._id.toString()] || 0
  }));
};

exports.likePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) return null;
  if (post.likes.some((id) => id.toString() === userId)) return post;
  post.likes.push(userId);
  await post.save();
  return post;
};

exports.unlikePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) return null;
  post.likes = post.likes.filter((id) => id.toString() !== userId);
  await post.save();
  return post;
};