import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';
import { expect } from 'chai';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();
const users = testHelpers.generateUsers();

describe('Transfers API at /transfers', () => {
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

  describe('GET /transfers', () => {
    context(`Given there aren't transfers`, () => {
      const requiredTestTables = ['users'];
      const expectedTotal = {total: 0};

      beforeEach(() => {
        return testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers')
          .expect(200, expectedTotal);
      });
    });

    context(`Given there are transfers`, () => {
      const requiredTestTables = ['users', 'transfers'];
      const expectedTotal = testHelpers.generateTransfers().reduce((acc, transfer) => {
        acc.total += transfer.amount;
        return acc;
      }, {total: 0})

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers')
          .expect(200, expectedTotal);
      });
    });
  });

  describe('GET /user/:id', () => {
    context(`Given there aren't transfers`, () => {
      const requiredTestTables = ['users'];
      const expectedTotal = {total: 0};

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(200, expectedTotal);
      });
    });

    context(`Given there are transfers`, () => {
      const requiredTestTables = ['users', 'transfers'];
      const expectedTotal = testHelpers.generateTransfers().reduce((acc, transfer) => {
        acc.total += transfer.amount;
        return acc;
      }, {total: 0})

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(200, expectedTotal);
      });
    });
  });

  describe('POST /user/:id', () => {
    context(`Success - creating a new post`, () => {
      const requiredTestTables = ['users'];
      const newPost = testHelpers.generateTransfers()[0];
      const expectedPost = {
        ...newPost,
      };

      it(`responds with 201 and the new post`, () => {
        return supertest(app)
          .post('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(201, expectedPost);
      });
    });

    context(`Error - receiver not a number`, () => {
      const requiredTestTables = ['users'];
      const newPost = testHelpers.generateTransfers()[0];
      const expectedPost = {
        ...newPost,
        receiver: '2'
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Receiver should be a number`, () => {
        return supertest(app)
          .post('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(400)
          .expect(res => {
            console.log(res.body)
            expect(res.body).to.deep.equal({
              error: `Receiver should be a number`
            });
          });
      });
    });

    context(`Error - amount should be a number`, () => {
      const requiredTestTables = ['users'];
      const newPost = testHelpers.generateTransfers()[0];
      const expectedPost = {
        ...newPost,
        amount: '2342.22'
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Amount should be a number`, () => {
        return supertest(app)
          .post('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(400)
          .expect(res => {
            console.log(res.body)
            expect(res.body).to.deep.equal({
              error: `Amount should be a number`
            });
          });
      });
    });

    context(`Error - user and receiver cannot match`, () => {
      const requiredTestTables = ['users'];
      const newPost = testHelpers.generateTransfers()[0];
      const expectedPost = {
        ...newPost,
        sender: 1,
        receiver: 1
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and User and receiver cannot match`, () => {
        return supertest(app)
          .post('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(400)
          .expect(res => {
            console.log(res.body)
            expect(res.body).to.deep.equal({
              error: `User and receiver cannot match`
            });
          });
      });
    });

    context(`Error - receiver not found`, () => {
      const requiredTestTables = ['users'];
      const newPost = testHelpers.generateTransfers()[0];
      const expectedPost = {
        ...newPost,
        sender: 1,
        receiver: 1
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 404 and Receiver not found`, () => {
        return supertest(app)
          .post('/transfers/user/1')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(404)
          .expect(res => {
            console.log(res.body)
            expect(res.body).to.deep.equal({
              error: `Receiver not found`
            });
          });
      });
    });
  });
});
