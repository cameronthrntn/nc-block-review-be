const express = require('express');
const articlesRouter = express.Router();
const {
  getArticles,
  getArticle,
  postArticle,
  patchArticle,
  deleteArticle
} = require('../controllers/articles.js');
const { postComment, getComments } = require('../controllers/comments.js');
const { notAllowed } = require('../errors');
const commentsRouter = require('./comments-router');

articlesRouter
  .route('/')
  .get(getArticles)
  .post(postArticle)
  .all(notAllowed);

articlesRouter
  .route('/:article_id')
  .get(getArticle)
  .patch(patchArticle)
  .delete(deleteArticle)
  .all(notAllowed);

articlesRouter
  .route('/:article_id/comments')
  .get(getComments)
  .post(postComment)
  .all(notAllowed);

module.exports = articlesRouter;
