const { connection } = require('../db/connection');

exports.selectUsers = () => {
  return connection('users').select('*');
};

exports.insertUser = body => {
  return connection('users')
    .insert(body)
    .returning('*');
};

exports.selectUserByUsername = username => {
  return connection
    .select('*')
    .from('users')
    .where('users.username', username);
};
