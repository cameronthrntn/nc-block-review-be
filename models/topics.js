const { connection } = require('../db/connection');

exports.selectTopics = () => {
  return connection.select('*').from('topics');
};

exports.selectTopicBySlug = slug => {
  return connection('topics')
    .select('*')
    .where({ slug });
};
