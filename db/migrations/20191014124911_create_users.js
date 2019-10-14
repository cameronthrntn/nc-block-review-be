exports.up = function(knex) {
  console.log('creating users table...');
  return knex.schema
    .createTable('users', usersTable => {
      usersTable
        .string('username')
        .primary()
        .unique()
        .notNullable();
      usersTable.string('avatar_url').notNullable();
      usersTable.string('name').notNullable();
    })
    .then(() => {
      console.log('users table created!');
    });
};

exports.down = function(knex) {
  console.log('Dropping users table...');
  return knex.schema.dropTable('users').then(() => {
    console.log('users table dropped.');
  });
};
