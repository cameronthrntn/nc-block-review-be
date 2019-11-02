const express = require('express');
const apiRouter = express.Router();
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const { notAllowed } = require('../errors');
const { loginController } = require('../controllers/login');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../knexfile');

apiRouter
  .route('/')
  .get((req, res, next) => {
    res.send({
      description: require('../api-description.json')
    });
  })
  .all(notAllowed);

apiRouter.post('/login', loginController);

apiRouter.use((req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, res) => {
    if (err) console.log(err, '<~ Error');
    else next();
  });
});

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
