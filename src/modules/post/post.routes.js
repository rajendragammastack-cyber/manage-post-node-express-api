const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const { body } = require('express-validator');
const validate = require('../../middlewares/validate.middleware');
const { upload } = require('../../config/multer');
const controller = require('./post.controller');

router.use(auth);

router.post(
  '/',
  upload.single('image'),
  [body('title').notEmpty(), body('content').notEmpty()],
  validate,
  controller.create
);

router.get('/feed', controller.getFeed);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

router.put(
  '/:id',
  upload.single('image'),
  [body('title').optional().notEmpty(), body('content').optional().notEmpty()],
  validate,
  controller.update
);

router.delete('/:id', controller.remove);

router.post('/:id/like', controller.likePost);
router.delete('/:id/like', controller.unlikePost);

module.exports = router;