const { connection } = require('../db/connection');

exports.selectTopics = () => {
  return connection.select('*').from('topics');
};

exports.selectTopicBySlug = slug => {
  return connection('topics')
    .select('*')
    .where({ slug });
};

exports.insertTopic = body => {
  return connection('topics')
    .insert(body)
    .returning('*');
};
