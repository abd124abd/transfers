import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';
import { expect } from 'chai';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();
const users = testHelpers.generateUsers();

describe('Payees API at /payees', () => {
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

  describe('ALL /:id', () => {
    context(`Error - id is not a number`, () => {
      const requiredTestTables = ['users'];

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it('responds with 400 and Id must be a number', () => {
        return supertest(app)
          .get('/payees/abc')
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .expect(res => {
            console.log(res.body)
            expect(res.body).to.deep.equal({
              error: `Id must be a number`
            });
          });
      });
    });
  });

  describe('GET /payees/:id', () => {
    context(`Given there aren't any payees`, () => {
      const requiredTestTables = ['users'];
      const expectedPayees = [];

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/payees/1')
          .expect(200, expectedPayees);
      });
    })

    context(`Given there are payees`, () => {
      const requiredTestTables = ['users', 'payees'];
      const expectedPayees = testHelpers.generatePayees().filter(payee => payee.sender === 1);

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 200 and an array of payees for selected user', () => {
        return supertest(app)
          .get('/payees/1')
          .expect(200, expectedPayees);
      });
    })
  });

  describe('POST /payees/:id', () => {
    // success - return new payee object
    context(`Success - creating a new a payee`, () => {

    });

    // error - payee property not provided

    // error - payee not a number

    // error - sender = payee

    // error - payee not found

    // error - payee already assigned to sender
  });

  describe('DELETE /payees/:id', () => {
    // success - 204 and end

    // error - payee not provided

    // error - payee not a number

    // error - sender = payee

    // error - payee not assigned to sender


  });

});
