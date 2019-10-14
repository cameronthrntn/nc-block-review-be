process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const {
  formatDates,
  makeRefObj,
  formatComments
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

  describe('makeRefObj', () => {});

  describe('formatComments', () => {});
});
