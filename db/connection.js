const ENV = process.env.NODE_ENV || 'development';
const knex = require('knex');

const config =
  ENV === 'production'
    ? { client: 'pg', connection: process.env.DATABASE_URL }
    : require('../knexfile');

console.log(config);

module.exports = { connection: knex(config) };

// const knex = require('knex');
// const config = require('../knexfile');

// exports.connection = knex(config);
