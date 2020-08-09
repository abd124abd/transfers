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
          .get(`/payees/1`)
          .expect(200, expectedPayees);
      });
    })

    context(`Given there are payees`, () => {
      const requiredTestTables = ['users', 'payees'];
      const sender = 1;
      const expectedPayees = testHelpers.generatePayees().filter(payee => payee.sender === sender);

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables)
      });

      it('responds with 200 and an array of payees for selected user', () => {
        return supertest(app)
          .get(`/payees/${sender}`)
          .expect(200, expectedPayees);
      });
    })
  });

  describe('POST /payees/:id', () => {
    // success - return new payee object
    context(`Success - creating a new a payee`, () => {
      const requiredTestTables = ['users'];
      const expectedPayee = testHelpers.generatePayees()[0];
      const newPayee = {
        ...expectedPayee,
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 201 and the new payee`, () => {
        return supertest(app)
          .post(`/payees/${newPayee.sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send(newPayee)
          .expect(201)
          .expect(res => {
            expect(res.body).to.deep.equal(expectedPayee);
          });
      });
    });

    // error - payee property not provided
    context(`Error - payee key not provided`, () => {
      const requiredTestTables = ['users'];
      const expectedPayee = testHelpers.generatePayees()[0];
      const newPayee = {
        ...expectedPayee,
      };

      delete newPayee.payee;

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Payee needs to be of type number`, () => {
        return supertest(app)
          .post(`/payees/${newPayee.sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send(newPayee)
          .expect(201)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Payee needs to be of type number`,
            });
          });
      });
    });

    // error - payee not a number
    context(`Error - payee needs to be of type number`, () => {
      const requiredTestTables = ['users'];
      const expectedPayee = testHelpers.generatePayees()[0];
      const newPayee = {
        ...expectedPayee,
        payee: 'abc',
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Payee needs to be of type number`, () => {
        return supertest(app)
          .post(`/payees/${newPayee.sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send(newPayee)
          .expect(201)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Payee needs to be of type number`,
            });
          });
      });
    });

    // error - sender = payee
    context(`Error - sender matches payee`, () => {
      const requiredTestTables = ['users'];
      const expectedPayee = testHelpers.generatePayees()[0];
      const newPayee = {
        ...expectedPayee,
        payee: 1,
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Sender and payee cannot match`, () => {
        return supertest(app)
          .post(`/payees/${newPayee.sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send(newPayee)
          .expect(201)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Sender and payee cannot match`,
            });
          });
      });
    });

    // error - payee not found
    context(`Error - Payee not found`, () => {
      const requiredTestTables = ['users'];
      const expectedPayee = testHelpers.generatePayees()[0];
      const newPayee = {
        ...expectedPayee,
        payee: 123,
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Sender and payee cannot match`, () => {
        return supertest(app)
          .post(`/payees/${newPayee.sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send(newPayee)
          .expect(201)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Payee not found`,
            });
          });
      });
    });

    // error - payee already assigned to sender
    context(`Error - Payee already assigned to sender`, () => {
      const requiredTestTables = ['users'];
      const expectedPayee = testHelpers.generatePayees()[0];
      const newPayee = {
        ...expectedPayee,
      };

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 400 and Sender and payee cannot match`, () => {
        return supertest(app)
          .post(`/payees/${newPayee.sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send(newPayee)
          .expect(201)
          .expect(res => {
            expect(res.body).to.deep.equal({
              error: `Payee is already assigned to sender`,
            });
          });
      });
    });
  });

  describe('DELETE /payees/:id', () => {
    // success - 204 and end
    context(`Success - Payee deleted`, () => {
      const requiredTestTables = ['users', 'payees'];
      const payeeToDelete = testHelpers.generatePayees()[0];
      const { sender, payee } = payeeToDelete;

      beforeEach(() => {
        testHelpers.seedTables(db, requiredTestTables);
      });

      it(`responds with 204`, () => {
        return supertest(app)
          .delete(`/payees/${sender}`)
          .set('Authorization', 'Bearer ' + testHelpers.generateAuthToken(users[0]))
          .send({payee})
          .expect(204);
      });
    });
  });

    // error - payee not provided

    // error - payee not a number

    // error - sender = payee

    // error - payee not assigned to sender

});
