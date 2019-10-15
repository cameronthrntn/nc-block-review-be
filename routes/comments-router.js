const express = require('express');
const commentsRouter = express.Router();
const { patchComment, deleteComment } = require('../controllers/comments.js');
const { notAllowed } = require('../errors');

commentsRouter
  .route('/:comment_id')
  .patch(patchComment)
  .delete(deleteComment)
  .all(notAllowed);

module.exports = commentsRouter;
