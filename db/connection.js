const knex = require('knex');
const config = require('../knexfile');

exports.connection = knex(config);
