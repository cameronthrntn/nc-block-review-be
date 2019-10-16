process.env.NODE_ENV = 'test';

const chai = require('chai');
const { expect } = chai;
const request = require('supertest');
const { app } = require('../app');
const chai_sorted = require('chai-sorted');
chai.use(chai_sorted);
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
    it('Status 405: Should only allow GET requests', () => {
      const notAllowed = ['put', 'patch', 'delete', 'post'];
      const promises = notAllowed.map(method => {
        return request(app)
          [method]('/api')
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal('Method not allowed!');
          });
      });
      return Promise.all(promises);
    });
    describe('GET', () => {
      describe('OK', () => {
        it('Status 200: Should return an object describing each endpoint of the API', () => {
          return request(app)
            .get('/api')
            .expect(200)
            .then(({ body }) => {
              expect(body.description).to.contain.keys([
                'Topics',
                'Users',
                'Articles',
                'Comments'
              ]);
            });
        });
      });
    });
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
      it('Status 405: Should only allow GET requests', () => {
        const notAllowed = ['put', 'delete', 'patch', 'post'];
        const promises = notAllowed.map(method => {
          return request(app)
            [method]('/api/articles')
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('Method not allowed!');
            });
        });
        return Promise.all(promises);
      });
      describe('GET', () => {
        describe('OK', () => {
          it('Status 200: Should return an array of results', () => {
            return request(app)
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => expect(body.articles).to.be.an('array'));
          });
          it('Status 200: Should return an array of size 12', () => {
            return request(app)
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.lengthOf(12);
              });
          });
          it('Status 200: Should sort given results by creation date by default', () => {
            return request(app)
              .get('/api/articles')
              .expect(200)
              .then(({ body }) =>
                expect(body.articles).to.be.sortedBy('created_at', {
                  descending: true
                })
              );
          });
          it('Status 200: Should sort given results by any valid column', () => {
            return request(app)
              .get('/api/articles?sort_by=article_id')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.sortedBy('article_id', {
                  descending: true
                });
              });
          });
          it('Status 200: Should be able to be ordered by asc or desc', () => {
            return request(app)
              .get('/api/articles?order=asc')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.sortedBy('created_at', {
                  descending: false
                });
              });
          });
          it('Status 200: Should be able to pass a sort query and an order', () => {
            return request(app)
              .get('/api/articles?sort_by=article_id&order=asc')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.sortedBy('article_id', {
                  descending: false
                });
              });
          });
          it('Status 200: Should be able to be filtered by author', () => {
            return request(app)
              .get('/api/articles?author=rogersop')
              .expect(200)
              .then(({ body }) => {
                expect(
                  body.articles.filter(article => article.author === 'rogersop')
                ).to.eql(body.articles);
              });
          });
          it('Status 200: Should be able to be filtered by topic', () => {
            return request(app)
              .get('/api/articles?topic=mitch')
              .expect(200)
              .then(({ body }) => {
                expect(
                  body.articles.filter(article => article.topic === 'mitch')
                ).to.eql(body.articles);
              });
          });
          it('Status 200: Should be able to be filtered by author and topic', () => {
            return request(app)
              .get('/api/articles?topic=mitch&author=rogersop')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles.length).to.equal(2);
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 404: Should return a 404 when trying to sort by a non-existant column', () => {
            it('Status 200: Should sort given results by any valid column', () => {
              return request(app)
                .get('/api/articles?sort_by=gpngwpngrnp')
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.be.equal('Column not found!');
                });
            });
          });
          it('Status 200: Should order given results by descending when given incorrect order', () => {
            return request(app)
              .get('/api/articles?order=vnsoibs')
              .expect(200)
              .then(({ body }) =>
                expect(body.articles).to.be.sortedBy('created_at', {
                  descending: true
                })
              );
          });
          it('Status 200: Should return an empty array for an author that doesnt exist', () => {
            return request(app)
              .get('/api/articles?author=vnsoibs')
              .expect(200)
              .then(({ body }) => expect(body.articles.length).to.equal(0));
          });
          it('Status 200: Should return an empty array for a topic that doesnt exist', () => {
            return request(app)
              .get('/api/articles?topic=vnsoibs')
              .expect(200)
              .then(({ body }) => expect(body.articles.length).to.equal(0));
          });
        });
      });
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
                  expect(body.article).to.contain.keys([
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
            it('Status 200: Should return an article with a comment_count property', () => {
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
                    'created_at',
                    'comment_count'
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
            it('Status 200: Should decrement an articles vote count when given an appropriate ID and a negative number', () => {
              return request(app)
                .patch('/api/articles/1')
                .send({ inc_votes: -20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.votes).to.equal(80);
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
                    username: 'butter_bridge'
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
                  .post('/api/articles/2/comments')
                  .send({
                    body: 'New comment',
                    username: 'butter_bridge'
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
              it('Status 422: Should return 422 for trying to post a comment to an article that doesnt exist ', () => {
                return request(app)
                  .post('/api/articles/587/comments')
                  .expect(422);
              });
              it('Status 400: Should return 400 for trying to post a comment by a user that doesnt exist ', () => {
                return request(app)
                  .post('/api/articles/1/comments')
                  .send({
                    body: 'New comment',
                    author: 'Incorrect_User',
                    votes: 312,
                    created_at: new Date(Date.now()).toGMTString()
                  })
                  .expect(400);
              });
              it('Status 404: Should return 404 for trying to post a comment to an article with an extra field ', () => {
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({
                    body: 'New comment',
                    author: 'butter_bridge',
                    votes: 312,
                    created_at: new Date(Date.now()).toGMTString(),
                    newField: 'OhDear'
                  })
                  .expect(404);
              });
              it('Status 400: Should return 400 for trying to post a comment to an article missing a NOT NULL field ', () => {
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({ body: 'merely a body' })
                  .expect(400);
              });
              it('Status 400: Should return 400 for trying to post a comment to an article with some invalid datatype', () => {
                return request(app)
                  .post('/api/articles/2/comments')
                  .send({
                    body: 'New comment',
                    author: 'butter_bridge',
                    votes: 'Some String Here',
                    created_at: new Date(Date.now()).toGMTString()
                  })
                  .expect(400);
              });
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
              it('Status 200: Should sort by created_at by default', () => {
                return request(app)
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('created_at', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should be able to be sorted by any column', () => {
                return request(app)
                  .get('/api/articles/1/comments?sort_by=votes')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('votes', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should be able to be sorted by asc or desc', () => {
                return request(app)
                  .get('/api/articles/1/comments?order=desc')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('created_at', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should be able to pass a sort query and an order', () => {
                return request(app)
                  .get('/api/articles/1/comments?sort_by=votes&order=desc')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('votes', {
                      descending: true
                    });
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
    describe('/comments', () => {
      describe('/:comment_id', () => {
        it('Status 405: Should only allow PATCH and DELETE requests', () => {
          const notAllowed = ['put', 'get', 'post'];
          const promises = notAllowed.map(method => {
            return request(app)
              [method]('/api/comments/4')
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal('Method not allowed!');
              });
          });
          return Promise.all(promises);
        });
        describe('PATCH', () => {
          describe('OK', () => {
            it('Status 200: Should increment a comments vote count when given an appropriate ID', () => {
              return request(app)
                .patch('/api/comments/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.votes).to.equal(36);
                });
            });
            it('Status 200: Should decrement a comments vote count when given an appropriate ID and a negative number', () => {
              return request(app)
                .patch('/api/comments/1')
                .send({ inc_votes: -5 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.votes).to.equal(11);
                });
            });
            it('Status 200: Should not modify any other part of the comment', () => {
              return request(app)
                .patch('/api/comments/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.votes).to.equal(36);
                  expect(body.comment_id).to.equal(1);
                  expect(body.body).to.equal(
                    "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
                  );
                  expect(body.author).to.equal('butter_bridge');
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 400: Should return a 400 when trying to increment any other columns', () => {
              return request(app)
                .patch('/api/comments/1')
                .send({ body: 'Im patching the body oh my', inc_votes: 201 })
                .expect(400);
            });
            it('Status 404: Should return a 404 for a non-existant article', () => {
              return request(app)
                .patch('/api/comments/2134')
                .send({ inc_votes: 20 })
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Comment not found!');
                });
            });
            it('Status 400: Should return a 400 for a non-valid ID', () => {
              return request(app)
                .patch('/api/Comments/commentName')
                .send({ inc_votes: 20 })
                .expect(400)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Bad request!');
                });
            });
          });
        });
        describe('DELETE', () => {
          describe('OK', () => {
            it('Status 204: Should delete a given comment', () => {
              return request(app)
                .del('/api/comments/1')
                .expect(204);
            });
            it('Status 204: Should not be able to find that comment on associated articles', () => {
              return request(app)
                .del('/api/comments/1')
                .expect(204)
                .then(() => {
                  return request(app)
                    .get('/api/articles/9/comments')
                    .expect(200);
                })
                .then(({ body }) => {
                  expect(
                    body.comments.filter(comment => comment.comment_id === 1)
                  ).to.be.empty;
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 404: Should return 404 for a non-existant comment', () => {
              return request(app)
                .del('/api/comments/29147')
                .expect(404);
            });
            it('Status 400: Should return 400 for a non-numerical comment ID', () => {
              return request(app)
                .del('/api/comments/AParticularComment')
                .expect(400);
            });
          });
        });
      });
    });
  });
});
