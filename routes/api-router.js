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
      description: {
        Topics: 'GET / - Displays a collection of available topics.',
        Users:
          'GET /:username - Displays information about a particular user, such as their username and personal avatar.',
        Articles: `GET / - Displays an array of all current articles and their information, this can then be sorted by any given valid property as well as ordered in ascending or descending order. These results can also be filtered by any combination of author and topic.

        GET /:article_id - Displays information from a particular article, such as it's title, votes, author, comment count, etc.

        PATCH /:article_id - Updates the given articles vote count (positive or negative).

        POST /:article_id/comments - Allows a user to post a new comment to a particular article (requiring a comment body and a valid username).

        GET /:article_id/comments - Displays all available comments for a particular article and their corresponding information.`,
        Comments: `PATCH: /:comment_id - Allows the updating of a comments vote by either positive or negative integer.
        
        DELETE: /:comment_id - Allows for a particular comment to be deleted. This returns no data.`
      }
    });
  })
  .all(notAllowed);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
