const { connection } = require('../db/connection');

exports.insertComment = (id, body) => {
  return connection('articles')
    .select('*')
    .where('article_id', id)
    .then(([article]) => {
      if (!article) {
        return Promise.reject({ code: 'noArticle' });
      } else {
        body.article_id = id;
        body.author = body.username;
        delete body.username;
        return connection
          .insert(body)
          .into('comments')
          .returning('*');
      }
    });
};

exports.selectComments = (id, { sort_by = 'created_at', order = 'desc' }) => {
  const orders = { asc: 'asc', desc: 'desc' };
  return connection('articles')
    .select('*')
    .where('article_id', id)
    .then(([article]) => {
      if (!article) {
        return Promise.reject({ code: 'noArticle' });
      } else {
        return connection('comments')
          .join('articles', 'articles.article_id', 'comments.article_id')
          .select(
            'comments.comment_id',
            'comments.author',
            'comments.votes',
            'comments.created_at',
            'comments.body',
            'articles.article_id'
          )
          .where('articles.article_id', id)
          .orderBy(sort_by, orders[order]);
      }
    });
};

exports.updateComment = (id, body) => {
  return connection('comments')
    .where('comments.comment_id', id)
    .increment('votes', body.inc_votes)
    .returning('*');
};
exports.removeComment = id => {
  return connection('comments')
    .where('comments.comment_id', id)
    .del()
    .returning('*');
};
