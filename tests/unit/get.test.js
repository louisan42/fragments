// tests/unit/get.test.js

//const { text } = require('express');
const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});

describe('GET /v1/fragments/?expand=1 || expand value not included, GET a converted fragment(GET /v1/fragments/:id(.txt)', () => {
  test('authenticated users get a expanded array of metadata', async () => {
    await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);

    const res = await request(app)
      .get('/v1/fragments/?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: expect.any(String),
          created: expect.any(String),
          updated: expect.any(String),
          size: expect.any(Number),
          ownerId: expect.any(String),
          id: expect.any(String),
        }),
      ])
    );
  });

  test('authenticated users get the id of metadata(not expanded)', async () => {
    await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);
    // now request for data
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toEqual(
      expect.not.objectContaining({
        type: expect.any(String),
        created: expect.any(String),
        updated: expect.any(String),
        size: expect.any(Number),
        ownerId: expect.any(String),
        id: expect.any(String),
      })
    );
    expect(res.body.fragments).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  test('convert id with extension', async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragments.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('This is a fragment');
  });

  test('convert id without extension', async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragments.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('This is a fragment');
    expect(res.header['content-type']).toBe('text/plain');
  });

  test('unsupported extension returns 415', async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragments.id}.json`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
  });
});
