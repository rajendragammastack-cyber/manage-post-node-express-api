const commentService = require('./comment.service');
const { sendResponse } = require('../../utils/apiResponse');

function buildTree(flat, parentId = null) {
  return flat
    .filter((c) => (parentId == null ? !c.parent : c.parent && c.parent.toString() === parentId))
    .map((c) => ({
      ...c,
      likeCount: (c.likes || []).length,
      userLiked: false,
      replies: buildTree(flat, c._id.toString())
    }));
}

function addUserLiked(comments, userId) {
  return comments.map((c) => ({
    ...c,
    userLiked: (c.likes || []).some((id) => id.toString() === userId),
    replies: addUserLiked(c.replies || [], userId)
  }));
}

function stripLikes(nodes) {
  return nodes.map(({ likes, ...c }) => ({
    ...c,
    replies: c.replies && c.replies.length ? stripLikes(c.replies) : []
  }));
}

exports.getByPost = async (req, res, next) => {
  try {
    const raw = await commentService.getByPost(req.params.postId);
    const flat = raw.map((c) => ({
      ...c,
      parent: c.parent ? String(c.parent) : null
    }));
    let tree = buildTree(flat, null);
    tree = addUserLiked(tree, req.user.id);
    tree = stripLikes(tree);
    sendResponse(res, { data: tree });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { postId, content, parentId } = req.body;
    const comment = await commentService.create({
      post: postId,
      content: (content || '').trim(),
      parent: parentId || null,
      user: req.user.id
    });
    const populated = await commentService.getOne(comment._id);
    sendResponse(res, { statusCode: 201, message: 'Comment added', data: populated });
  } catch (err) { next(err); }
};

exports.like = async (req, res, next) => {
  try {
    const comment = await commentService.like(req.params.id, req.user.id);
    if (!comment) throw { statusCode: 404, message: 'Comment not found' };
    sendResponse(res, { message: 'Liked', data: { likeCount: comment.likes.length, userLiked: true } });
  } catch (err) { next(err); }
};

exports.unlike = async (req, res, next) => {
  try {
    const comment = await commentService.unlike(req.params.id, req.user.id);
    if (!comment) throw { statusCode: 404, message: 'Comment not found' };
    sendResponse(res, { message: 'Unliked', data: { likeCount: comment.likes.length, userLiked: false } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const comment = await commentService.remove(req.params.id, req.user.id);
    if (!comment) throw { statusCode: 404, message: 'Comment not found' };
    sendResponse(res, { message: 'Comment deleted' });
  } catch (err) { next(err); }
};
