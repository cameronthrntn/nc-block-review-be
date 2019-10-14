const express = require('express');
const usersRouter = express.Router();
const { getUserByUsername } = require('../controllers/users.js');
const { notAllowed } = require('../errors');

usersRouter
  .route('/:username')
  .get(getUserByUsername)
  .all(notAllowed);

module.exports = { usersRouter };
