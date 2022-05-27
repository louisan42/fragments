// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // non-existing-route is not defined in the API routes, so it should return a 404
  test('non-existing resources should return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existing-route')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
    expect(res.body.error.code).toBe(404);
  });
});
