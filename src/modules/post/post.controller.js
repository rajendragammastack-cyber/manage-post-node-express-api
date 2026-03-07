const service = require('./post.service');
const { sendResponse } = require('../../utils/apiResponse');

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body, user: req.user.id };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    const post = await service.create(data);
    sendResponse(res, { statusCode: 201, message: 'Post created', data: post });
  } catch (err) { next(err); }
};

exports.getFeed = async (req, res, next) => {
  try {
    const posts = await service.getFeed(req.user.id);
    const clean = posts.map(({ likes, ...p }) => p);
    sendResponse(res, { data: clean });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const posts = await service.getAll(req.user.id);
    sendResponse(res, { data: posts });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const post = await service.getOne(req.params.id, req.user.id);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    sendResponse(res, { data: post });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const post = await service.getById(req.params.id);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    const likeCount = (post.likes || []).length;
    const userLiked = (post.likes || []).some((id) => id.toString() === req.user.id);
    const { likes, ...rest } = post;
    sendResponse(res, { data: { ...rest, likeCount, userLiked } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.image = '/uploads/' + req.file.filename;
    const post = await service.update(req.params.id, req.user.id, body);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    sendResponse(res, { message: 'Post updated', data: post });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const post = await service.remove(req.params.id, req.user.id);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    sendResponse(res, { message: 'Post deleted' });
  } catch (err) { next(err); }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await service.likePost(req.params.id, req.user.id);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    sendResponse(res, { message: 'Liked', data: { likeCount: post.likes.length, userLiked: true } });
  } catch (err) { next(err); }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const post = await service.unlikePost(req.params.id, req.user.id);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    sendResponse(res, { message: 'Unliked', data: { likeCount: post.likes.length, userLiked: false } });
  } catch (err) { next(err); }
};



// function successMessage(action, entity) {
//   return `${entity} ${action} successfully`;
// }

// // usage
// successMessage("created", "Post")
// successMessage("updated", "User")
// successMessage("deleted", "Order")


// function errorMessage(action, entity) {
//   return `Failed to ${action} ${entity}. Please try again.`;
// }

// // usage
// errorMessage("create", "Post")
// errorMessage("update", "User")
// errorMessage("delete", "Order")
