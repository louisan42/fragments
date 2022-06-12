const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/:id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments/:id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // if fragment does not exist, return 404
  test('should return 404 if the fragment does not exist', async () => {
    await request(app)
      .delete('/v1/fragments/1234')
      .auth('user1@email.com', 'password1')
      .expect(404);
  });

  // if fragment exists, delete it, return status OK
  test('should delete fragment if it exists', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const res = await request(app)
      .delete(`/v1/fragments/${response.body.fragments.id}`)
      .auth('user1@email.com', 'password1')
      .expect(200);
    expect(res.body.status).toBe('ok');

    const dRes = await request(app)
      .get(`/v1/fragments/${response.body.fragments.id}`)
      .auth('user1@email.com', 'password1');
    expect(dRes.statusCode).toBe(404);
  });
});
