const { connection } = require('../db/connection');

exports.selectArticle = id => {
  return connection('articles')
    .select('articles.*')
    .count({ comment_count: 'comments.article_id' })
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .groupBy('articles.article_id')
    .where('articles.article_id', id);
};

exports.updateArticle = (id, body) => {
  return connection('articles')
    .where('articles.article_id', id)
    .increment('votes', body.inc_votes)
    .returning('*');
};

exports.selectArticles = ({ sort_by = 'created_at', order, author, topic }) => {
  const orders = { asc: 'asc', desc: 'desc' };
  return connection('articles')
    .select('*')
    .modify(query => {
      if (author) query.where({ author });
      if (topic) query.where({ topic });
    })
    .orderBy(sort_by, orders[order] || 'desc');
};
