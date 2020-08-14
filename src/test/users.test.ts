import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';
import { expect } from 'chai';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();
const users = testHelpers.generateUsers();

describe('Users API at /users', () => {
  let db;

  before(() => {
     db = knex({
       client: 'pg',
       connection: TEST_DB_URL,
     });

     app.set('db', db);
  });

  after(() => {
    return db.destroy();
  });

  beforeEach(() => {
    return testHelpers.truncateTables(db);
  });

  afterEach(() => {
    return testHelpers.truncateTables(db);
  });

  describe('GET at /:id', () => {
    // success selecting user, return user serialized
    context(`Success - selecting a user`, () => {
      const requiredTestTables = ['users'];
      const user = testHelpers.generateUsers()[0];

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 200 and the user', () => {
        return supertest(app)
          .get(`/users/${user.id}`)
          .expect(200, user);
      });
    })

    // error - id is not a number
    context(`Error - id is not a number`, () => {
      const requiredTestTables = ['users'];
      const userId = 'abc';

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Id must be a number', () => {
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: 'Id must be a number',
            });
          });
      });
    });

    // error - user not found
    context(`Error - user not found`, () => {
      const requiredTestTables = ['users'];
      const userId = 123;

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Id must be a number', () => {
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: 'User not found',
            });
          });
      });
    });
  });

  describe('POST', () => {
    // success new user created returns new user serialized
    context(`Success - creating a new user`, () => {
      const requiredTestTables = ['users'];
      const user = {
        'username': 'userFromTest',
        'password': 'abc123abc'
      }

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 201 and the user serialized', () => {
        return supertest(app)
          .post(`/users`)
          .send(user)
          .expect(201)
          .expect(res => {
            const {username} = res.body;
            expect(username).to.equal(user.username)
          });
      });
    });

    // error username missing
    context(`Error - username missing`, () => {
      const requiredTestTables = ['users'];
      const user = {
        'password': 'abc123abc'
      }

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Missing username in request body', () => {
        return supertest(app)
          .post(`/users`)
          .send(user)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Missing username in request body`,
            });
          });
      });
    });

    // error password missing
    context(`Error - Password missing`, () => {
      const requiredTestTables = ['users'];
      const user = {
        'username': 'userFromTest'
      }

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Missing password in request body', () => {
        return supertest(app)
          .post(`/users`)
          .send(user)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Missing password in request body`,
            });
          });
      });
    });

    // error username length < 3 characters
    context(`Error - Username length < 3 characters`, () => {
      const requiredTestTables = ['users'];
      const user = {
        'username': 'ab',
        'password': 'abc123abc'
      }

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Username must be 3 or more characters long', () => {
        return supertest(app)
          .post(`/users`)
          .send(user)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Username must be 3 or more characters long`,
            });
          });
      });
    });

    // error password length < 8 characters
    context(`Error - Password length < 8 characters`, () => {
      const requiredTestTables = ['users'];
      const user = {
        'username': 'userFromTest',
        'password': 'abc1234'
      }

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Password length must be between 8 and 64 characters', () => {
        return supertest(app)
          .post(`/users`)
          .send(user)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Password length must be between 8 and 64 characters`,
            });
          });
      });
    });

    // error password length > 64 characters
    context(`Error - Password length > 64 characters`, () => {
      const requiredTestTables = ['users'];
      const user = {
        'username': 'userFromTest',
        'password': `LlBRN8ml5xIUekC4ljNxfjXahmEbrFHV7q6XECz7k6lraf7X0zlWOGNndicbu6iR9`
      }

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and Password length must be between 8 and 64 characters', () => {
        return supertest(app)
          .post(`/users`)
          .send(user)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Password length must be between 8 and 64 characters`,
            });
          });
      });
    });

    // error user already exists
    context(`Error - User already exists`, () => {
      const requiredTestTables = ['users'];
      const user = testHelpers.generateUsers()[0];
      const newUser = {
        username: user.username,
        password: user.password,
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 400 and User already exists', () => {
        return supertest(app)
          .post(`/users`)
          .send(newUser)
          .expect(400)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Password length must be between 8 and 64 characters`,
            });
          });
      });
    });
  });
});
