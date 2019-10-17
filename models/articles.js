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
  const articleQuery = connection('articles')
    .select('articles.*')
    .count({ comment_count: 'comments.article_id' })
    .leftJoin('comments', 'comments.article_id', 'articles.article_id')
    .groupBy('articles.article_id')
    .modify(query => {
      if (author) query.where({ 'articles.author': author });
      if (topic) query.where({ 'articles.topic': topic });
    })
    .orderBy(sort_by, orders[order] || 'desc');

  const promiseArray = [articleQuery];

  if (author) {
    const userQuery = connection
      .select('*')
      .from('users')
      .where('username', author)
      .then(user => {
        if (!user.length) return Promise.reject({ code: '22P02' });
      });
    promiseArray.push(userQuery);
  }
  if (topic) {
    const topicQuery = connection
      .select('*')
      .from('topics')
      .where('slug', topic)
      .then(topic => {
        if (!topic.length) return Promise.reject({ code: '22P02' });
      });
    promiseArray.push(topicQuery);
  }

  return Promise.all(promiseArray)
    .then(promises => {
      return promises[0];
    })
    .catch(err => {
      return Promise.reject({ code: '22P02' });
    });
};
