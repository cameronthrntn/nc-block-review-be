const {
  selectUsers,
  insertUser,
  selectUserByUsername
} = require('../models/users.js');

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then(users => {
      res.send({ users });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  insertUser(req.body)
    .then(([user]) => {
      res.status(201).send({ user });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params.username)
    .then(([user]) => {
      if (!user) res.status(404).send({ msg: 'User not found!' });
      else res.send({ user });
    })
    .catch(next);
};
