const { insertComment, selectComments } = require('../models/comments.js');

exports.postComment = (req, res, next) => {
  insertComment(req.params.article_id, req.body)
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch(err => {
      if (err.code === 'noArticle')
        res.status(422).send({ msg: 'Article not found!' });
      else next(err);
    });
};

exports.getComments = (req, res, next) => {
  selectComments(req.params.article_id, req.query)
    .then(comments => {
      res.send({ comments });
    })
    .catch(err => {
      if (err.code === 'noArticle')
        res.status(404).send({ msg: 'Article not found!' });
      else next(err);
    });
};
