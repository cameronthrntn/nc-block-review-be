process.env.NODE_ENV = 'test';

const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const { app } = require('../app');
// const chai_sorted = require('chai-sorted');
// chai.use(chai_sorted);
const { connection } = require('../db/connection');

describe('endpoints', () => {
  after(() => {
    connection.destroy();
  });
  it('Status 404: path not found for invalid path', () => {
    return request(app)
      .get('/api/sdfsdf')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.equal('Route not found');
      });
  });
  describe('/api', () => {
    describe('/topics', () => {
      describe('GET', () => {
        describe('OK', () => {
          it('Status 200: should return an array of topics', () => {
            return request(app)
              .get('/api/topics')
              .expect(200)
              .then(({ body }) => {
                expect(body.topics).to.be.an('array');
                expect(body.topics[0]).to.be.an('object');
              });
          });
          it('Status 200: each topic should have a slug and description', () => {
            return request(app)
              .get('/api/topics')
              .expect(200)
              .then(({ body }) => {
                expect(body.topics[0]).to.have.keys(['slug', 'description']);
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 405: Should only allow GET requests', () => {
            const notAllowed = ['put', 'patch', 'delete', 'post'];
            const promises = notAllowed.map(method => {
              return request(app)
                [method]('/api/topics')
                .expect(405)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Method not allowed!');
                });
            });
            return Promise.all(promises);
          });
        });
      });
    });
  });
});
