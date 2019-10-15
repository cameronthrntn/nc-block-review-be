const { connection } = require('../db/connection');

exports.selectUserByUsername = username => {
  return connection
    .select('*')
    .from('users')
    .where('users.username', username);
};
