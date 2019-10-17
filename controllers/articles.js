const {
  selectArticle,
  updateArticle,
  selectArticles,
  insertArticle
} = require('../models/articles.js');
const { selectUserByUsername } = require('../models/users');
const { selectTopicBySlug } = require('../models/topics');

exports.getArticle = (req, res, next) => {
  selectArticle(req.params.article_id)
    .then(([article]) => {
      if (article) res.send({ article });
      else res.status(404).send({ msg: 'Article not found!' });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  if (Object.keys(req.body).join('') != 'inc_votes') next({ code: '22P02' });
  else
    updateArticle(req.params.article_id, req.body)
      .then(([article]) => {
        if (article) res.send({ article });
        else res.status(404).send({ msg: 'Article not found!' });
      })
      .catch(next);
};

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then(articles => {
      res.send({ returned_results: articles.length, articles });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  insertArticle(req.body)
    .then(([article]) => {
      res.send({ article });
    })
    .catch(next);
};
