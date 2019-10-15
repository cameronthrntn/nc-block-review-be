const { connection } = require('../db/connection');

exports.selectArticle = id => {
  return connection
    .select('*')
    .from('articles')
    .where('article_id', id);
};

exports.updateArticle = (id, body) => {
  return connection('articles')
    .where('articles.article_id', id)
    .increment('votes', body.inc_votes)
    .returning('*');
};
