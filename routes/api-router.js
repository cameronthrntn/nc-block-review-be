const express = require('express');
const apiRouter = express.Router();
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const { notAllowed } = require('../errors');

apiRouter
  .route('/')
  .get((req, res, next) => {
    res.send({
      description: require('../api-description.json')
    });
  })
  .all(notAllowed);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
