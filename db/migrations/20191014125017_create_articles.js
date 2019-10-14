exports.up = function(knex) {
  console.log('creating articles table...');
  return knex.schema
    .createTable('articles', articlesTable => {
      articlesTable.increments('article_id').primary();
      articlesTable.string('title').notNullable();
      articlesTable.text('body').notNullable();
      articlesTable.integer('votes').defaultTo(0);
      articlesTable.string('topic').notNullable();
      articlesTable
        .string('author')
        .references('users.username')
        .notNullable();
      articlesTable.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .then(() => {
      console.log('articles table created!');
    });
};

exports.down = function(knex) {
  console.log('Dropping articles table...');
  return knex.schema.dropTable('articles').then(() => {
    console.log('articles table dropped.');
  });
};
