exports.formatDates = list => {
  const arr = [];
  list.forEach(item => {
    arr.push({ ...item });
  });
  const dates = arr.map(item => {
    item.created_at = new Date(item.created_at).toGMTString();
    return item;
  });
  return dates;
};

exports.makeRefObj = list => {
  const ref = {};
  list.forEach(obj => {
    ref[obj.title] = obj.article_id;
  });
  return ref;
};

exports.formatComments = (comments, articleRef) => {
  const rtrn = [];
  comments.forEach(item => {
    rtrn.push({ ...item });
  });
  for (let i = 0; i < rtrn.length; i++) {
    rtrn[i].author = rtrn[i].created_by;
    if (articleRef) rtrn[i].belongs_to = articleRef[rtrn[i].belongs_to];
    rtrn[i].article_id = rtrn[i].belongs_to;
    delete rtrn[i].created_by;
    delete rtrn[i].belongs_to;
  }
  return rtrn;
};
