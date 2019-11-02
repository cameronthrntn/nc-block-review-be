const { connection } = require('../db/connection');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../knexfile');
const bcrypt = require('bcrypt');

exports.loginController = (req, res, next) => {
  const { username, password } = req.body;
  return connection('users')
    .select('*')
    .where({ username })
    .then(([user]) => {
      if (user)
        return Promise.all([bcrypt.compare(password, user.password), user]);
      else next({ code: 'invalidCredentials' });
    })
    .then(([passwordOk, user]) => {
      if (user && passwordOk) {
        const token = jwt.sign(
          { user: user.username, iat: Date.now() },
          JWT_SECRET
        );
        res.send({ token });
      } else {
        next({ code: 'invalidCredentials' });
      }
    })
    .catch(next);
};
