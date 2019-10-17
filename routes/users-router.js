const express = require('express');
const usersRouter = express.Router();
const {
  getUserByUsername,
  getUsers,
  postUser
} = require('../controllers/users.js');
const { notAllowed } = require('../errors');

usersRouter
  .route('/')
  .get(getUsers)
  .post(postUser)
  .all(notAllowed);

usersRouter
  .route('/:username')
  .get(getUserByUsername)
  .all(notAllowed);

module.exports = usersRouter;
