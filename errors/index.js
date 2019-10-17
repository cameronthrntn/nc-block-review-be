exports.handleSQLError = (err, req, res, next) => {
  // console.log(err);

  switch (err.code) {
    case '22P02':
      res.status(400).send({ msg: 'Bad request!' });
      break;
    case '42703':
      res.status(404).send({ msg: 'Column not found!' });
      break;
    case '23502':
      res.status(400).send({ msg: 'Missing required data!' });
      break;
    case '23503':
      res.status(422).send({ msg: 'Relation does not exist!' });
      break;
    default:
      console.log(err);
      res.status(500).send({ msg: 'Internal error!' });
  }
};

exports.notAllowed = (req, res, next) => {
  res.status(405).send({ msg: 'Method not allowed!' });
};
