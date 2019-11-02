process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments,
  formatUsers
} = require('../db/utils/utils');

describe('UTILS', () => {
  describe('formatDates', () => {
    it('Should accept an array of one entry and return that same array with a formatted new date', () => {
      const obj = [{ created_at: 1542284514171 }];
      const newObj = [{ created_at: new Date(1542284514171).toGMTString() }];
      expect(formatDates(obj)).to.eql(newObj);
    });
    it('Should not mutate the original aray', () => {
      const obj = [{ created_at: 154700514171 }];
      formatDates(obj);
      expect(obj).to.eql([{ created_at: 154700514171 }]);
    });
    it('Should format an array of multiple objects made at different times', () => {
      const obj = [{ created_at: 154700514171 }, { created_at: 154700820171 }];
      const newObj = [
        { created_at: new Date(154700514171).toGMTString() },
        { created_at: new Date(154700820171).toGMTString() }
      ];
      expect(formatDates(obj)).to.eql(newObj);
    });
  });

  describe('makeRefObj', () => {
    const articleData = [
      {
        article_id: 1,
        title: 'Living in the shadow of a great man'
      }
    ];
    it('Should accept an array with an object and return a RO with the id relating to the title', () => {
      expect(makeRefObj(articleData)).to.eql({
        'Living in the shadow of a great man': 1
      });
    });
    it('Should accept an array with multiple objects', () => {
      articleData.push({
        article_id: 2,
        title: 'New Title'
      });
      expect(makeRefObj(articleData)).to.eql({
        'Living in the shadow of a great man': 1,
        'New Title': 2
      });
    });
  });

  describe('formatComments', () => {
    it('Should accept an array of one comment and a reference object and return an array with the formated comment having its created_by changed to an author key', () => {
      const obj = [{ created_by: 'john', belongs_to: 'articleTitle' }];
      expect(formatComments(obj)[0].author).to.equal('john');
    });
    it('Should have an article_id key and NOT a belongs_to key', () => {
      const obj = [{ created_by: 'john', belongs_to: 1 }];
      expect(formatComments(obj)[0]).to.haveOwnProperty('article_id');
      expect(formatComments(obj)[0]).to.not.haveOwnProperty('belongs_to');
    });
    it('Should be able to convert a given article title to its appropriate id', () => {
      const obj = [{ created_by: 'john', belongs_to: 'articleTitle' }];
      const ref = { articleTitle: 1 };
      expect(formatComments(obj, ref)[0]).to.eql({
        author: 'john',
        article_id: 1
      });
    });
    it('Should not mutate the original array', () => {
      const obj = [{ created_by: 'john', belongs_to: 'articleTitle' }];
      const ref = { articleTitle: 1 };
      formatComments(obj);
      expect(obj).to.eql([{ created_by: 'john', belongs_to: 'articleTitle' }]);
    });
  });
  describe('formatUsers', () => {
    it('User passwords should be encrypted before being stored in the DB', () => {
      let users = [{ password: 'testPassword' }];
      expect(formatUsers(users)[0].password).to.not.equal(users[0].password);
    });
  });
});
