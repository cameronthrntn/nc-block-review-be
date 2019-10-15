const { selectUserByUsername } = require('../models/users.js');

exports.getUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params.username)
    .then(([user]) => {
      if (!user) res.status(404).send({ msg: 'User not found!' });
      else res.send({ user });
    })
    .catch(next);
};
