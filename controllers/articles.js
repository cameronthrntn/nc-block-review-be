const {
  selectArticle,
  updateArticle,
  selectArticles
} = require('../models/articles.js');

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
        if (article) res.send(article);
        else res.status(404).send({ msg: 'Article not found!' });
      })
      .catch(next);
};

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then(articles => {
      res.send({ articles });
    })
    .catch(next);
};
