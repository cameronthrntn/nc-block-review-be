process.env.NODE_ENV = 'test';

const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const { app } = require('../app');
// const chai_sorted = require('chai-sorted');
// chai.use(chai_sorted);
const { connection } = require('../db/connection');

after(() => connection.destroy());
beforeEach(() => connection.seed.run());

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
        describe('Error Handling', () => {});
      });
    });
    describe('/users', () => {
      describe('/:username', () => {
        it('Status 405: Should only allow GET requests', () => {
          const notAllowed = ['put', 'patch', 'delete', 'post'];
          const promises = notAllowed.map(method => {
            return request(app)
              [method]('/api/users/rogersop')
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal('Method not allowed!');
              });
          });
          return Promise.all(promises);
        });
        describe('GET', () => {
          describe('OK', () => {
            it('Status 200: should return a the appropriate user for the given username', () => {
              return request(app)
                .get('/api/users/rogersop')
                .expect(200)
                .then(({ body }) => {
                  expect(body.user).to.eql({
                    username: 'rogersop',
                    name: 'paul',
                    avatar_url:
                      'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4'
                  });
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 404: Should return a 404 for a username that is not found', () => {
              return request(app)
                .get('/api/users/invalidUsername')
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('User not found!');
                });
            });
          });
        });
      });
    });
    describe('/articles', () => {
      describe('/:article_id', () => {
        it('Status 405: Should only allow GET and PATCH requests', () => {
          const notAllowed = ['put', 'delete', 'post'];
          const promises = notAllowed.map(method => {
            return request(app)
              [method]('/api/articles/1')
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal('Method not allowed!');
              });
          });
          return Promise.all(promises);
        });
        describe('GET', () => {
          describe('OK', () => {
            it('Status 200: Should return the given article based on the passed id', () => {
              return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(({ body }) => {
                  expect(body.article).to.have.keys([
                    'article_id',
                    'title',
                    'body',
                    'votes',
                    'topic',
                    'author',
                    'created_at'
                  ]);
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 404: Should return a 404 for a non-existant article', () => {
              return request(app)
                .get('/api/articles/2134')
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Article not found!');
                });
            });
            it('Status 400: Should return a 400 for a non-valid ID', () => {
              return request(app)
                .get('/api/articles/articleName')
                .expect(400)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Bad request!');
                });
            });
          });
        });
        describe('PATCH', () => {
          describe('OK', () => {
            it('Status 200: Should increment an articles vote count when given an appropriate ID', () => {
              return request(app)
                .patch('/api/articles/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.votes).to.equal(120);
                });
            });
            it('Status 200: Should not modify any other part of the article', () => {
              return request(app)
                .patch('/api/articles/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.votes).to.equal(120);
                  expect(body.article_id).to.equal(1);
                  expect(body.body).to.equal(
                    'I find this existence challenging'
                  );
                  expect(body.author).to.equal('butter_bridge');
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 400: Should return a 404 when trying to increment any other columns', () => {
              return request(app)
                .patch('/api/articles/1')
                .send({ body: 'Im patching the body oh my', inc_votes: 201 })
                .expect(400)
                .then(() => {
                  return request(app)
                    .get('/api/articles/1')
                    .expect(200);
                })
                .then(({ body }) => {
                  expect(body.article.body).to.equal(
                    'I find this existence challenging'
                  );
                  expect(body.article.votes).to.equal(100);
                });
            });
            it('Status 404: Should return a 404 for a non-existant article', () => {
              return request(app)
                .patch('/api/articles/2134')
                .send({ inc_votes: 20 })
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Article not found!');
                });
            });
            it('Status 400: Should return a 400 for a non-valid ID', () => {
              return request(app)
                .patch('/api/articles/articleName')
                .send({ inc_votes: 20 })
                .expect(400)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Bad request!');
                });
            });
          });
        });
        describe('/comments', () => {
          it('Status 405: Should only allow POST and GET requests', () => {
            const notAllowed = ['delete', 'patch', 'put'];
            const promises = notAllowed.map(method => {
              return request(app)
                [method]('/api/articles/1/comments')
                .expect(405)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Method not allowed!');
                });
            });
            return Promise.all(promises);
          });
          describe('POST', () => {
            describe('OK', () => {
              it('Status 201: Should create a new comment with the given information', () => {
                return request(app)
                  .post('/api/articles/1/comments')
                  .send({
                    body: 'New comment',
                    article_id: 2,
                    author: 'butter_bridge',
                    votes: 312,
                    created_at: new Date(Date.now()).toGMTString()
                  })
                  .expect(201)
                  .then(({ body }) => {
                    expect(body.comment).to.contain.keys(
                      'comment_id',
                      'author',
                      'article_id'
                    );
                  });
              });
              it('Status 200: Should appear on a given articles list of comments', () => {
                return request(app)
                  .post('/api/articles/1/comments')
                  .send({
                    body: 'New comment',
                    article_id: 2,
                    author: 'butter_bridge',
                    votes: 312,
                    created_at: new Date(Date.now()).toGMTString()
                  })
                  .expect(201)
                  .then(() => {
                    return request(app)
                      .get('/api/articles/2/comments')
                      .expect(200)
                      .then(({ body }) => {
                        const commentBodies = body.comments.map(
                          comment => comment.body
                        );
                        expect(commentBodies).to.include('New comment');
                      });
                  });
              });
            });
            describe('Error Handling', () => {
              it('Status 422: Should return 422 for trying to post a comment to an article that doesnt exist ', () => {});
              it('Status 400: Should return 400 for trying to post a comment to an article with an extra field ', () => {});
              it('Status 400: Should return 400 for trying to post a comment to an article missing a NOT NULL field ', () => {});
              it('Status 400: Should return 422 for trying to post a comment to an article with some invalid datatype', () => {});
            });
          });
          describe('GET', () => {
            describe('OK', () => {
              it('Status 200: Should return an array of comments', () => {
                return request(app)
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.an('array');
                  });
              });
              it('Status 200: All comments should have the same article id as the one passed in the request', () => {
                return request(app)
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    body.comments.forEach(comment => {
                      // console.log(comment);
                      expect(comment.article_id).to.equal(1);
                    });
                  });
              });
              it('Status 200: Should return an empty array for an article with no comments', () => {
                return request(app)
                  .get('/api/articles/2/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.eql([]);
                  });
              });
            });
            describe('Error Handling', () => {
              it('Status 404: Should return 404 for the comments of an article that doesnt exist', () => {
                return request(app)
                  .get('/api/articles/1049/comments')
                  .expect(404)
                  .then(({ body }) => {
                    expect(body.msg).to.equal('Article not found!');
                  });
              });
            });
          });
        });
      });
    });
  });
});
