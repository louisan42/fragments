const request = require('supertest');

const app = require('../../src/app');
//const logger = require('../../src/logger');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Unsupported content types should be return 415
  test('unsupported content types return 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/msword')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  // Using a valid username/password pair to test post request
  test('authenticated users can post fragments', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });
});
