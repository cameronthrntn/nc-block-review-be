const express = require('express');
const topicsRouter = express.Router();
const { getTopics, postTopic } = require('../controllers/topics.js');
const { notAllowed } = require('../errors');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopic)
  .all(notAllowed);

module.exports = topicsRouter;
