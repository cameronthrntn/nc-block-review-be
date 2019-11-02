const {
  topicData,
  articleData,
  commentData,
  userData
} = require('../data/index.js');

const {
  formatDates,
  formatComments,
  makeRefObj,
  formatUsers
} = require('../utils/utils');

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      const topicsInsertions = knex('topics')
        .insert(topicData)
        .returning('*');

      const encryptedusers = formatUsers(userData);
      const usersInsertions = knex('users')
        .insert(encryptedusers)
        .returning('*');

      return Promise.all([topicsInsertions, usersInsertions]);
    })
    .then(() => {
      const formatted = formatDates(articleData);
      return knex('articles')
        .insert(formatted)
        .returning('*');
    })
    .then(articleRows => {
      const articleRef = makeRefObj(articleRows);
      const formattedComments = formatComments(
        formatDates(commentData),
        articleRef
      );
      return knex('comments')
        .insert(formattedComments)
        .returning('*');
    });
};
