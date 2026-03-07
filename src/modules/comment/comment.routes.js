const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const { body } = require('express-validator');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./comment.controller');

router.use(auth);

router.get('/by-post/:postId', controller.getByPost);

router.post(
  '/',
  [
    body('postId').notEmpty(),
    body('content').notEmpty().trim()
  ],
  validate,
  controller.create
);

router.post('/:id/like', controller.like);
router.delete('/:id/like', controller.unlike);
router.delete('/:id', controller.remove);

module.exports = router;
