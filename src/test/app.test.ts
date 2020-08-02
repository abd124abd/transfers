import app from '../app';
import supertest from "supertest";

describe('App', () => {
  it('GET / responds with 200 containing "home"', () => {
    return supertest(app)
      .get("/")
      .expect(200, "home")
  })
})
