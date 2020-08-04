import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();

describe('Payees API at /payees', () => {
  let db;
  const requiredTestTables = ['users', 'payees'];

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

});
