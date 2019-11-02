const bcrypt = require('bcrypt');

exports.formatDates = list => {
  return list.map(item => {
    const spreadObj = { ...item };
    spreadObj.created_at = new Date(item.created_at).toGMTString();
    return spreadObj;
  });
};

exports.makeRefObj = list => {
  const ref = {};
  list.forEach(obj => {
    ref[obj.title] = obj.article_id;
  });
  return ref;
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(item => {
    const comment = { ...item };
    comment.author = comment.created_by;
    if (articleRef) comment.belongs_to = articleRef[comment.belongs_to];
    comment.article_id = comment.belongs_to;
    delete comment.created_by;
    delete comment.belongs_to;
    return comment;
  });
};

exports.formatUsers = users => {
  return users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 10)
  }));
};
