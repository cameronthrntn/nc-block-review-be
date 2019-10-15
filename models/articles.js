const { connection } = require('../db/connection');

exports.selectArticle = id => {
  return connection('articles')
    .select('*')
    .where('articles.article_id', id);
  // return connection('articles')
  //   .select('*')
  //   .count('comments.comment_id')
  //   .leftOuterJoin('comments', 'comments.article_id', 'articles.article_id')
  //   .groupBy('articles.article_id')
  //   .where('articles.article_id', id)
  //   .then(article => {
  //     console.log(article);
  //   });
  // .then(article => {
  //   return
  //     comments: connection
  //       .select('comment_id')
  //       .from('comments')
  //       .where('comments.article_id', id),
  //     article: article[0]

  // })
};

exports.updateArticle = (id, body) => {
  return connection('articles')
    .where('articles.article_id', id)
    .increment('votes', body.inc_votes)
    .returning('*');
};

exports.selectArticles = ({ sort_by = 'created_at', order, author, topic }) => {
  const orders = { asc: 'asc', desc: 'desc' };
  if (author && topic) {
    return connection('articles')
      .select('*')
      .where({ author, topic })
      .orderBy(sort_by, orders[order] || 'desc');
  } else if (topic) {
    return connection('articles')
      .select('*')
      .where('articles.topic', topic)
      .orderBy(sort_by, orders[order] || 'desc');
  } else if (author) {
    return connection('articles')
      .select('*')
      .where('articles.author', author)
      .orderBy(sort_by, orders[order] || 'desc');
  } else {
    return connection('articles')
      .select('*')
      .orderBy(sort_by, orders[order] || 'desc');
  }
};
