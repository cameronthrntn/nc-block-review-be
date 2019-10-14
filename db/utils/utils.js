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

exports.makeRefObj = list => {};

exports.formatComments = (comments, articleRef) => {};
