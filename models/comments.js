const { connection } = require('../db/connection');

exports.insertComment = (id, body) => {
  return connection
    .insert(body)
    .into('comments')
    .returning('*');
};

exports.selectComments = id => {
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
          .where('articles.article_id', id);
      }
    });
};
