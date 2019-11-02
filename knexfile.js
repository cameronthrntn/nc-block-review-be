const { DB_URL } = process.env;
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
    JWT_SECRET: 'secret key',
    connection: {
      database: 'nc_news',
      ...creds
    }
  },
  test: {
    JWT_SECRET: 'secret key',

    connection: {
      database: 'nc_news_test',
      ...creds
    }
  },
  production: {
    connection: `${DB_URL}?ssl=true`
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
