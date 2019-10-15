const express = require('express');
const articlesRouter = express.Router();
const { getArticle, patchArticle } = require('../controllers/articles.js');
const { postComment, getComments } = require('../controllers/comments.js');
const { notAllowed } = require('../errors');
const commentsRouter = require('./comments-router');

articlesRouter
  .route('/:article_id')
  .get(getArticle)
  .patch(patchArticle)
  .all(notAllowed);

articlesRouter
  .route('/:article_id/comments')
  .get(getComments)
  .post(postComment)
  .all(notAllowed);

module.exports = articlesRouter;
