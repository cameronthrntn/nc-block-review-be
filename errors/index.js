exports.handleSQLError = (err, req, res, next) => {
  switch (err.code) {
    case '22P02':
      res.status(400).send({ msg: 'Incorrect data type!' });
      break;
    case '42703':
      res.status(404).send({ msg: 'Column not found!' });
      break;
    case '23502':
      res.status(400).send({ msg: 'Missing required data!' });
      break;
    case '23503':
      res.status(400).send({ msg: 'Shop does not exist!' });
      break;
    default:
      console.log(err);
      res.status(500).send({ msg: 'Internal SQL error!' });
  }
};

//Controller for error handling, not middleare function
exports.notAllowed = (req, res, next) => {
  res.status(405).send({ msg: 'Method not allowed!' });
};
