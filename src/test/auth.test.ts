import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';
import { expect } from 'chai';
import AuthService from '../auth/auth-service';
import UsersService from '../users/users-service';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();

describe('Auth API at /auth', () => {
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

  describe('Post at /login', () => {
    // success login return user serialized and authToken
    context(`Success - login`, () => {
      const newUser = {
        username: 'testuser',
        password: 'password'
      };

      it('responds with 200 and the serialized user as well as the token', () => {
        return supertest(app)
          .post(`/users`)
          .send(newUser)
          .then(res => {
            const user = res.body;
            const expectedResponse = {
              user: UsersService.serializeGetUser(user),
              authToken: AuthService.createJWT(user.username, {user_id: user.id})
            };
            return supertest(app)
              .post(`/auth/login`)
              .send(newUser)
              .expect(200, expectedResponse)
          });
      });
    });

    // error username missing
    context(`Error - username mssing`, () => {
      const newUser = {
        username: 'testuser',
        password: 'password'
      };

      it('responds with 400 and Missing username in request body', () => {
        return supertest(app)
          .post(`/users`)
          .send(newUser)
          .then(res => {
            delete newUser.username;
            return supertest(app)
              .post(`/auth/login`)
              .send(newUser)
              .expect(400)
              .expect(res => {
                expect(res.body).to.deep.equal({
                  error: `Missing username in request body`,
                });
              });
          });
      });
    });

    // error password missing
    context(`Error - password mssing`, () => {
      const newUser = {
        username: 'testuser',
        password: 'password'
      };

      it('responds with 400 and Missing password in request body', () => {
        return supertest(app)
          .post(`/users`)
          .send(newUser)
          .then(res => {
            delete newUser.password;
            return supertest(app)
              .post(`/auth/login`)
              .send(newUser)
              .expect(400)
              .expect(res => {
                expect(res.body).to.deep.equal({
                  error: `Missing password in request body`,
                });
              });
          });
      });
    });

    // error user not found
    context(`Error - user not found`, () => {
      const newUser = {
        username: 'testuser',
        password: 'password'
      };

      it('responds with 400 and User not found', () => {
        return supertest(app)
          .post(`/auth/login`)
          .send(newUser)
          .expect(404)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `User not found`,
            });
          });
      });
    });

    // error password is incorrect
    context(`Error - password is incorrect`, () => {
      const newUser = {
        username: 'testuser',
        password: 'password'
      };

      it('responds with 400 and Password is incorrect', () => {
        return supertest(app)
          .post(`/users`)
          .send(newUser)
          .then(res => {
            newUser.password = 'wrongPassword';
            return supertest(app)
              .post(`/auth/login`)
              .send(newUser)
              .expect(400)
              .expect(res => {
                expect(res.body).to.deep.equal({
                  error: `Password is incorrect`,
                });
              });
          });
      });
    });
  });
});
