import app from '../app';
import supertest from "supertest";
import config from '../config';
import TestHelpers from './test-helpers';
import knex from 'knex';

const { TEST_DB_URL } = config;
const testHelpers = new TestHelpers();

describe('App at /', () => {
  it('GET / responds with 200 and all the transfers', () => {
    return supertest(app)
      .get('/')
      .expect(200)
  });
})
