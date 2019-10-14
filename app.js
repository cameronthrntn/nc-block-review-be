const express = require('express');
const app = express();
const { apiRouter } = require('./routes/api-router');
const { handleSQLError } = require('./errors');

app.use(express.json());

app.use('/api', apiRouter);
app.all('/*', (req, res, next) =>
  res.status(404).send({ msg: 'Route not found' })
);

app.use(handleSQLError);

module.exports = { app };
