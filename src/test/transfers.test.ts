import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';
import { expect } from 'chai';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();

describe('Transfers API at /transfers', () => {
  let db;
  const requiredTestTables = ['users', 'transfers'];

  before(() => {
     db = knex({
       client: 'pg',
       connection: TEST_DB_URL,
     });

     app.set('db', db);
  });

  after(() => {
    db.destroy();
  });

  describe('GET /transfers', () => {

    context(`Given there aren't transfers`, () => {
      const expectedTotal = {total: 0};

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers')
          .expect(200, expectedTotal);
      });
    });

    context(`Given there are transfers`, () => {
      const expectedTotal = testHelpers.generateTransfers().reduce((acc, transfer) => {
        acc.total += transfer.amount;
        return acc;
      }, {total: 0})

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      afterEach(() => {
        testHelpers.truncateTables(db, requiredTestTables);
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
      const expectedTotal = {total: 0};

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers')
          .expect(200, expectedTotal);
      });
    });

    context(`Given there are transfers`, () => {
      const expectedTotal = testHelpers.generateTransfers().reduce((acc, transfer) => {
        acc.total += transfer.amount;
        return acc;
      }, {total: 0})

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      afterEach(() => {
        testHelpers.truncateTables(db, requiredTestTables);
      });

      it('responds with 200 and an object with the sum of transfer amounts', () => {
        return supertest(app)
          .get('/transfers')
          .expect(200, expectedTotal);
      });
    });
  });

  describe('POST /user/:id', () => {

    context(`Given there are transfers`, () => {

    });
  });

  describe('DELETE /user/:id', () => {

    context(`Given there are transfers`, () => {

    });
  });
})
