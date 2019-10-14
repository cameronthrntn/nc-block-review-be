const express = require('express');
const apiRouter = express.Router();
const { topicsRouter } = require('./topics-router');
const { usersRouter } = require('./users-router');

apiRouter.route('/').get((req, res, next) => {
  res.send('Welcome to the api!');
});
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);

module.exports = { apiRouter };
