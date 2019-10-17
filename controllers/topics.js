const { selectTopics, insertTopic } = require('../models/topics.js');

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then(topics => {
      res.send({ topics });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  insertTopic(req.body)
    .then(topic => {
      res.status(201).send({ topic });
    })
    .catch(next);
};
