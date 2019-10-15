const express = require('express');
const topicsRouter = express.Router();
const { getTopics } = require('../controllers/topics.js');
const { notAllowed } = require('../errors');

topicsRouter
  .route('/')
  .get(getTopics)
  .all(notAllowed);

module.exports = topicsRouter;
