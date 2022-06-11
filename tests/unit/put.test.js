const request = require('supertest');
const app = require('../../src/app');

describe('PUT /fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // if fragment type does not match the type of the fragment, return 400
  test('should return a 400 if the fragment type does not match existing', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const res = await request(app)
      .put(`/v1/fragments/${response.body.fragments.id}`)
      .set('Content-Type', 'image/jpg')
      .auth('user1@email.com', 'password1')
      .send('This is an update');
    expect(res.statusCode).toBe(400);
  });

  // if fragment does not exist, return 404
  test('should return 404 if the fragment does not exist', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const res = await request(app)
      .put(`/v1/fragments/${1234}`)
      .auth('user1@email.com', 'password1')
      .send('This is an update');
    expect(res.statusCode).toBe(404);
  });

  test('should update fragment if requirements pass', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    const res = await request(app)
      .put(`/v1/fragments/${response.body.fragments.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is an update');

    expect(res.statusCode).toBe(200);

    expect(Date.parse(await res.body.fragment.updated)).toBeGreaterThan(
      Date.parse(response.body.fragments.updated)
    );
  });
});
