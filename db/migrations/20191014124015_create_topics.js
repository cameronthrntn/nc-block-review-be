exports.up = function(knex) {
  // console.log('creating topics table...');
  return knex.schema
    .createTable('topics', topicsTable => {
      topicsTable
        .string('slug')
        .primary()
        .unique()
        .notNullable();
      topicsTable.string('description').notNullable();
    })
    .then(() => {
      // console.log('topics table created!');
    });
};

exports.down = function(knex) {
  // console.log('Dropping topics table...');
  return knex.schema.dropTable('topics').then(() => {
    // console.log('topics table dropped.');
  });
};
