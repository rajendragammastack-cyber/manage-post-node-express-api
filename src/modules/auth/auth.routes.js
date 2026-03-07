const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./auth.controller');

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  controller.login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  validate,
  controller.refresh
);

const authMiddleware = require('../../middlewares/auth.middleware');
router.get('/me', authMiddleware, controller.me);

module.exports = router;