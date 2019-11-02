exports.up = function(knex) {
  return knex.schema.table('users', userTable => {
    userTable.string('password');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', userTable => {
    userTable.dropColumn('password');
  });
};
