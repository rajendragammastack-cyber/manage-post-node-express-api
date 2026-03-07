const router = require('express').Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/posts', require('../modules/post/post.routes'));
router.use('/comments', require('../modules/comment/comment.routes'));

module.exports = router;