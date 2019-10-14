const ENV = process.env.NODE_ENV || 'development';
const creds = require('./db/config');

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

const customConfig = {
  development: {
    connection: {
      database: 'nc_news',
      ...creds
    }
  },
  test: {
    connection: {
      database: 'nc_news_test',
      ...creds
    }
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
