process.env.NODE_ENV = 'test';

const chai = require('chai');
const { expect } = chai;
const { app } = require('../app');
const defaults = require('superagent-defaults');
const request = defaults(require('supertest')(app));
const chai_sorted = require('chai-sorted');
chai.use(chai_sorted);
const { connection } = require('../db/connection');

after(() => connection.destroy());
beforeEach(() => {
  return connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run())
    .then(() => {
      return request
        .post('/api/login')
        .send({ username: 'rogersop', password: 'testPassword' })
        .expect(200);
    })
    .then(({ body }) => {
      request.set('authorization', `BEARER ${body.token}`);
    });
});

describe('endpoints', () => {
  it('Status 404: path not found for invalid path', () => {
    return request
      .get('/sdfsdf')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.equal('Route not found');
      });
  });
  describe('/api', () => {
    it('Status 405: Should only allow GET requests', () => {
      const notAllowed = ['put', 'patch', 'delete', 'post'];
      const promises = notAllowed.map(method => {
        return request[method]('/api')
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
          return request
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
    describe('/login', () => {
      describe('POST', () => {
        describe('OK', () => {
          it('Status 200: responds with an access token when given valid username and password', () => {
            return request
              .post('/api/login')
              .send({ username: 'rogersop', password: 'testPassword' })
              .expect(200)
              .then(({ body }) => {
                expect(body).to.haveOwnProperty('token');
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 401: Should reject a user with an incorrect username', () => {
            return request
              .post('/api/login')
              .send({ username: 'doesntexist', password: 'testPassword' })
              .expect(401)
              .then(({ body }) => {
                expect(body.msg).to.equal(
                  'The provided login credentials are invalid'
                );
              });
          });
          it('Status 401: Should reject a user with an incorrect password', () => {
            return request
              .post('/api/login')
              .send({ username: 'rogersop', password: 'wrongPassword' })
              .expect(401)
              .then(({ body }) => {
                expect(body.msg).to.equal(
                  'The provided login credentials are invalid'
                );
              });
          });
        });
      });
    });
    describe('/topics', () => {
      it('Status 405: Should only allow GET and POST requests', () => {
        const notAllowed = ['put', 'patch', 'delete'];
        const promises = notAllowed.map(method => {
          return request[method]('/api/topics')
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
            return request
              .get('/api/topics')
              .expect(200)
              .then(({ body }) => {
                expect(body.topics).to.be.an('array');
                expect(body.topics[0]).to.be.an('object');
              });
          });
          it('Status 200: each topic should have a slug and description', () => {
            return request
              .get('/api/topics')
              .expect(200)
              .then(({ body }) => {
                expect(body.topics[0]).to.have.keys(['slug', 'description']);
              });
          });
        });
        describe('Error Handling', () => {});
      });
      describe('POST', () => {
        describe('OK', () => {
          it('Status 201: Should allow the posting of a new topic', () => {
            return request
              .post('/api/topics')
              .send({
                description: 'New Topic',
                slug: 'Its a new topic...'
              })
              .expect(201);
          });
          it('Status 200: The new topic should appear when searching for all topics', () => {
            return request
              .post('/api/topics')
              .send({
                description: 'New Topic',
                slug: 'Its a new topic...'
              })
              .expect(201)
              .then(() => {
                return request.get('/api/topics').expect(200);
              })
              .then(({ body }) => {
                const slugs = body.topics.map(topic => topic.slug);
                expect(slugs).to.include('Its a new topic...');
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 400: Should return a 400 when given a topic without needed fields', () => {
            return request
              .post('/api/topics')
              .send({ slug: 'this wont work' })
              .expect(400);
          });
        });
      });
    });
    describe('/users', () => {
      it('Status 405: Should only allow GET and POST requests', () => {
        const notAllowed = ['put', 'patch', 'delete'];
        const promises = notAllowed.map(method => {
          return request[method]('/api/users')
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('Method not allowed!');
            });
        });
        return Promise.all(promises);
      });
      describe('GET', () => {
        describe('OK', () => {
          it('Status 200: Should return an array of users', () => {
            return request
              .get('/api/users')
              .expect(200)
              .then(({ body }) => {
                expect(body.users).to.be.an('array');
                expect(body.users[0]).to.be.an('object');
              });
          });
        });
        // describe('Error Handling', () => {});
      });
      describe('POST', () => {
        describe('OK', () => {
          it('Status 201: Should allow the posting of a new user', () => {
            return request
              .post('/api/users')
              .send({
                username: 'newuser',
                name: 'theirname',
                password: 'testPassword',
                avatar_url: 'This can be anything really'
              })
              .expect(201)
              .then(({ body }) => {
                expect(body.user.username).to.equal('newuser');
              });
          });
          it('Status 200: New user should appear on list of users', () => {
            return request
              .post('/api/users')
              .send({
                username: 'newuser',
                name: 'theirname',
                avatar_url: 'This can be anything really'
              })
              .expect(201)
              .then(() => {
                return request
                  .get('/api/users')
                  .expect(200)
                  .then(({ body }) => {
                    const users = body.users.map(user => user.username);
                    expect(users).to.include('newuser');
                  });
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 400: Should return a 400 when given a user without needed fields', () => {
            return request
              .post('/api/users')
              .send({ username: 'this wont work' })
              .expect(400);
          });
        });
      });
      describe('/:username', () => {
        it('Status 405: Should only allow GET requests', () => {
          const notAllowed = ['put', 'patch', 'delete', 'post'];
          const promises = notAllowed.map(method => {
            return request[method]('/api/users/rogersop')
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal('Method not allowed!');
              });
          });
          return Promise.all(promises);
        });
        describe('GET', () => {
          describe('OK', () => {
            it('Status 200: should return the appropriate user for the given username', () => {
              return request
                .get('/api/users/rogersop')
                .expect(200)
                .then(({ body }) => {
                  expect(body.user.username).to.eql('rogersop');
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 404: Should return a 404 for a username that is not found', () => {
              return request
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
      it('Status 405: Should only allow GET and POST requests', () => {
        const notAllowed = ['put', 'delete', 'patch'];
        const promises = notAllowed.map(method => {
          return request[method]('/api/articles')
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
            return request
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => expect(body.articles).to.be.an('array'));
          });
          it('Status 200: Each article should have a comment_count property', () => {
            return request
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => {
                body.articles.forEach(article => {
                  expect(article).to.haveOwnProperty('comment_count');
                });
              });
          });
          it('Status 200: Should sort given results by creation date by default', () => {
            return request
              .get('/api/articles')
              .expect(200)
              .then(({ body }) =>
                expect(body.articles).to.be.sortedBy('created_at', {
                  descending: true
                })
              );
          });
          it('Status 200: Should sort given results by any valid column', () => {
            return request
              .get('/api/articles?sort_by=article_id')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.sortedBy('article_id', {
                  descending: true
                });
              });
          });
          it('Status 200: Should be able to be ordered by asc or desc', () => {
            return request
              .get('/api/articles?order=asc')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.sortedBy('created_at', {
                  descending: false
                });
              });
          });
          it('Status 200: Should be able to pass a sort query and an order', () => {
            return request
              .get('/api/articles?sort_by=article_id&order=asc')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.sortedBy('article_id', {
                  descending: false
                });
              });
          });
          it('Status 200: Should be able to be filtered by author', () => {
            return request
              .get('/api/articles?author=rogersop')
              .expect(200)
              .then(({ body }) => {
                expect(
                  body.articles.filter(article => article.author === 'rogersop')
                ).to.eql(body.articles);
              });
          });
          it('Status 200: Should be able to be filtered by topic', () => {
            return request
              .get('/api/articles?topic=mitch')
              .expect(200)
              .then(({ body }) => {
                expect(
                  body.articles.filter(article => article.topic === 'mitch')
                ).to.eql(body.articles);
              });
          });
          it('Status 200: Should be able to be filtered by author and topic', () => {
            return request
              .get('/api/articles?topic=mitch&author=rogersop')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles.length).to.equal(2);
              });
          });
          it('Status 200: Should return an array of size 10 by default', () => {
            return request
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.lengthOf(10);
              });
          });
          it('Status 200: Should return an array of size n', () => {
            return request
              .get('/api/articles?limit=7')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.lengthOf(7);
              });
          });
          it('Status 200: Should only show the first page of results by default', () => {
            return request
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[0].article_id).to.equal(1);
                expect(body.articles[9].article_id).to.equal(10);
              });
          });
          it('Status 200: Should show a different page of results when passed a "p" query', () => {
            return request
              .get('/api/articles?p=2')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[0].article_id).to.equal(11);
              });
          });
          it('Status 200: Should show be able to have 3 pages when limit is 4', () => {
            return request
              .get('/api/articles?p=3&limit=4')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[0].article_id).to.equal(9);
                expect(body.articles).to.be.lengthOf(4);
              });
          });
          it('Status 200: Should order given results by descending when given incorrect order', () => {
            return request
              .get('/api/articles?order=vnsoibs')
              .expect(200)
              .then(({ body }) =>
                expect(body.articles).to.be.sortedBy('created_at', {
                  descending: true
                })
              );
          });
          it('Status 200: Should return all results when given a limit higher than the total number of articles', () => {
            return request
              .get('/api/articles?limit=200')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.lengthOf(12);
              });
          });
          it('Status 200: Should return less items on the last page is items dont divide evenly among pages', () => {
            return request
              .get('/api/articles?p=2&limit=7')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.be.lengthOf(5);
              });
          });
          it('Status 200: Should return an empty array for a user that exists but has no articles', () => {
            return request
              .get('/api/articles?author=lurker')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.eql([]);
              });
          });
          xit('Status 200: Should have a key for the total number of articles', () => {
            return request
              .get('/api/articles')
              .expect(200)
              .then(({ body }) => {
                expect(body).to.haveOwnProperty('total_count');
              });
          });
          xit('Status 200: The total_count should reflect the number of rows returned after a query but before limiting', () => {
            return request
              .get('/api/articles?author=rogersop&limit=2')
              .expect(200)
              .then(({ body }) => {
                expect(body.total_count).to.equal(3);
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 400: Should return a 400 when trying to sort by a non-existant column', () => {
            return request.get('/api/articles?sort_by=gpngwpngrnp').expect(400);
          });
          it('Status 400: Should return a 400 for an author that doesnt exist', () => {
            return request.get('/api/articles?author=vnsoibs').expect(400);
          });
          it('Status 400: Should return a 400 for a topic that doesnt exist', () => {
            return request.get('/api/articles?topic=vnsoibs').expect(400);
          });
        });
      });
      describe('POST', () => {
        describe('OK', () => {
          it('Status 200: SHould let a user post a valid new article and return said article', () => {
            return request
              .post('/api/articles')
              .send({
                title: 'New Article!',
                body: 'This is a new article posted to the api',
                topic: 'mitch',
                author: 'rogersop'
              })
              .expect(200)
              .then(({ body }) => {
                expect(body.article).to.have.keys(
                  'article_id',
                  'title',
                  'body',
                  'votes',
                  'topic',
                  'author',
                  'created_at'
                );
              });
          });
          it('Status 200: Should appear on the list of articles', () => {
            return request
              .post('/api/articles')
              .send({
                title: 'New Article!',
                body: 'This is a new article posted to the api',
                topic: 'mitch',
                author: 'rogersop'
              })
              .expect(200)
              .then(() => {
                return request.get('/api/articles/13').expect(200);
              })
              .then(({ body }) => {
                expect(body.article.title).to.equal('New Article!');
              });
          });
        });
        describe('Error Handling', () => {
          it('Status 400: Should return 400 when request body is missing required fields', () => {
            return request
              .post('/api/articles')
              .send({
                body: 'This is a new article posted to the api',
                topic: 'mitch',
                author: 'rogersop'
              })
              .expect(400);
          });
          it('Status 422: Should return 422 when request body has invalid foreign keys', () => {
            return request
              .post('/api/articles')
              .send({
                title: 'New Article!',
                body: 'This is a new article posted to the api',
                topic: 'mitch',
                author: 'doesntExist'
              })
              .expect(422);
          });
        });
      });
      describe('/:article_id', () => {
        it('Status 405: Should only allow GET, PATCH , and DELETE requests', () => {
          const notAllowed = ['put', 'post'];
          const promises = notAllowed.map(method => {
            return request[method]('/api/articles/1')
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
              return request
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
              return request
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
              return request
                .get('/api/articles/2134')
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Article not found!');
                });
            });
            it('Status 400: Should return a 400 for a non-valid ID', () => {
              return request
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
              return request
                .patch('/api/articles/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.article.votes).to.equal(120);
                });
            });
            it('Status 200: Should decrement an articles vote count when given an appropriate ID and a negative number', () => {
              return request
                .patch('/api/articles/1')
                .send({ inc_votes: -20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.article.votes).to.equal(80);
                });
            });
            it('Status 200: Should not modify any other part of the article', () => {
              return request
                .patch('/api/articles/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.article.votes).to.equal(120);
                  expect(body.article.article_id).to.equal(1);
                  expect(body.article.body).to.equal(
                    'I find this existence challenging'
                  );
                  expect(body.article.author).to.equal('butter_bridge');
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 400: Should return a 404 when trying to increment any other columns', () => {
              return request
                .patch('/api/articles/1')
                .send({ body: 'Im patching the body oh my', inc_votes: 201 })
                .expect(400)
                .then(() => {
                  return request.get('/api/articles/1').expect(200);
                })
                .then(({ body }) => {
                  expect(body.article.body).to.equal(
                    'I find this existence challenging'
                  );
                  expect(body.article.votes).to.equal(100);
                });
            });
            it('Status 404: Should return a 404 for a non-existant article', () => {
              return request
                .patch('/api/articles/2134')
                .send({ inc_votes: 20 })
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Article not found!');
                });
            });
            it('Status 400: Should return a 400 for a non-valid ID', () => {
              return request
                .patch('/api/articles/articleName')
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
            it('Status 204: Should allow for the deletion of an article when given a valid id', () => {
              return request.del('/api/articles/1').expect(204);
            });
          });
          describe('Error Handling', () => {
            it('Status 404: Should return 404 for comments of that article once it has been deleted', () => {
              return request
                .del('/api/articles/1')
                .expect(204)
                .then(() => {
                  return request.get('/api/articles/1/comments').expect(404);
                });
            });
            it('Status 404: Should return 404 for trying to delete an article that doesnt exist', () => {
              return request.del('/api/articles/342').expect(404);
            });
          });
        });
        describe('/comments', () => {
          it('Status 405: Should only allow POST and GET requests', () => {
            const notAllowed = ['delete', 'patch', 'put'];
            const promises = notAllowed.map(method => {
              return request[method]('/api/articles/1/comments')
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
                return request
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
                return request
                  .post('/api/articles/2/comments')
                  .send({
                    body: 'New comment',
                    username: 'butter_bridge'
                  })
                  .expect(201)
                  .then(() => {
                    return request
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
                return request.post('/api/articles/587/comments').expect(422);
              });
              it('Status 400: Should return 400 for trying to post a comment by a user that doesnt exist ', () => {
                return request
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
                return request
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
                return request
                  .post('/api/articles/2/comments')
                  .send({ body: 'merely a body' })
                  .expect(400);
              });
              it('Status 400: Should return 400 for trying to post a comment to an article with some invalid datatype', () => {
                return request
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
                return request
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.an('array');
                  });
              });
              it('Status 200: All comments should have the same article id as the one passed in the request', () => {
                return request
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    body.comments.forEach(comment => {
                      expect(comment.article_id).to.equal(1);
                    });
                  });
              });
              it('Status 200: Should return an empty array for an article with no comments', () => {
                return request
                  .get('/api/articles/2/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.eql([]);
                  });
              });
              it('Status 200: Should sort by created_at by default', () => {
                return request
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('created_at', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should be able to be sorted by any column', () => {
                return request
                  .get('/api/articles/1/comments?sort_by=votes')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('votes', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should be able to be sorted by asc or desc', () => {
                return request
                  .get('/api/articles/1/comments?order=desc')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('created_at', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should be able to pass a sort query and an order', () => {
                return request
                  .get('/api/articles/1/comments?sort_by=votes&order=desc')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.sortedBy('votes', {
                      descending: true
                    });
                  });
              });
              it('Status 200: Should return an array of size 10 by default', () => {
                return request
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.lengthOf(10);
                  });
              });
              it('Status 200: Should return an array of size n', () => {
                return request
                  .get('/api/articles/1/comments?limit=7')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.lengthOf(7);
                  });
              });
              it('Status 200: Should only show the first page of results by default', () => {
                return request
                  .get('/api/articles/1/comments')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments[0].comment_id).to.equal(2);
                    expect(body.comments[9].comment_id).to.equal(11);
                  });
              });
              it('Status 200: Should show a different page of results when passed a "p" query', () => {
                return request
                  .get('/api/articles/1/comments?p=2')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments[0].comment_id).to.equal(12);
                  });
              });
              it('Status 200: Should show be able to have 3 pages when limit is 4', () => {
                return request
                  .get('/api/articles/1/comments?p=3&limit=4')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments[0].comment_id).to.equal(10);
                    expect(body.comments).to.be.lengthOf(4);
                  });
              });
              it('Status 200: Should return all results when given a limit higher than the total number of comments', () => {
                return request
                  .get('/api/articles/1/comments?limit=200')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.lengthOf(13);
                  });
              });
              it('Status 200: Should return less items on the last page is items dont divide evenly among pages', () => {
                return request
                  .get('/api/articles/1/comments?p=2&limit=7')
                  .expect(200)
                  .then(({ body }) => {
                    expect(body.comments).to.be.lengthOf(6);
                  });
              });
            });
            describe('Error Handling', () => {
              it('Status 404: Should return 404 for the comments of an article that doesnt exist', () => {
                return request
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
            return request[method]('/api/comments/4')
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
              return request
                .patch('/api/comments/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment.votes).to.equal(36);
                });
            });
            it('Status 200: Should decrement a comments vote count when given an appropriate ID and a negative number', () => {
              return request
                .patch('/api/comments/1')
                .send({ inc_votes: -5 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment.votes).to.equal(11);
                });
            });
            it('Status 200: Should not modify any other part of the comment', () => {
              return request
                .patch('/api/comments/1')
                .send({ inc_votes: 20 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment.votes).to.equal(36);
                  expect(body.comment.comment_id).to.equal(1);
                  expect(body.comment.body).to.equal(
                    "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
                  );
                  expect(body.comment.author).to.equal('butter_bridge');
                });
            });
          });
          describe('Error Handling', () => {
            it('Status 400: Should return a 400 when trying to increment any other columns', () => {
              return request
                .patch('/api/comments/1')
                .send({ body: 'Im patching the body oh my', inc_votes: 201 })
                .expect(400);
            });
            it('Status 404: Should return a 404 for a non-existant article', () => {
              return request
                .patch('/api/comments/2134')
                .send({ inc_votes: 20 })
                .expect(404)
                .then(({ body }) => {
                  expect(body.msg).to.equal('Comment not found!');
                });
            });
            it('Status 400: Should return a 400 for a non-valid ID', () => {
              return request
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
              return request.del('/api/comments/1').expect(204);
            });
            it('Status 204: Should not be able to find that comment on associated articles', () => {
              return request
                .del('/api/comments/1')
                .expect(204)
                .then(() => {
                  return request.get('/api/articles/9/comments').expect(200);
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
              return request.del('/api/comments/29147').expect(404);
            });
            it('Status 400: Should return 400 for a non-numerical comment ID', () => {
              return request
                .del('/api/comments/AParticularComment')
                .expect(400);
            });
          });
        });
      });
    });
  });
});
