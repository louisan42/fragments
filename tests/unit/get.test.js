// tests/unit/get.test.js

//const { text } = require('express');
const request = require('supertest');

const app = require('../../src/app');

const fs = require('fs');

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
      .get(`/v1/fragments/${response.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('This is a fragment');
  });

  test(`convert .md to html`, async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# h1 header');

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('text/html');

    expect(res.text).toBe('<h1>h1 header</h1>\n');
  });

  test(`convert .json to text`, async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ message: 'hello world' });

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragment.id}.json`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('application/json');

    expect(res.text).toBe('{"message":"hello world"}');
  });

  test('render id without extension', async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragment.id}`)
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
      .get(`/v1/fragments/${response.body.fragment.id}.docx`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
  });
});
// conversion test to increase test coverage

test('image uploads', async () => {
  const response = await request(app)
    .post('/v1/fragments/')
    .auth('user1@email.com', 'password1')
    .set('Content-type', 'image/jpeg')
    .send(fs.readFileSync(`${__dirname}/testUploads/R.jpeg`));
  expect(response.status).toBe(201);

  const res = await request(app)
    .get(`/v1/fragments/${response.body.fragment.id}`)
    .auth('user1@email.com', 'password1');
  expect(res.type).toBe('image/jpeg');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual(Buffer.from(fs.readFileSync(`${__dirname}/testUploads/R.jpeg`)));
});

test('convert webp to gif', async () => {
  const response = await request(app)
    .post('/v1/fragments/')
    .auth('user1@email.com', 'password1')
    .set('Content-type', 'image/webp')
    .send(fs.readFileSync(`${__dirname}/testUploads/mountains.webp`));
  expect(response.status).toBe(201);

  const res = await request(app)
    .get(`/v1/fragments/${response.body.fragment.id}.gif`)
    .auth('user1@email.com', 'password1');
  expect(res.type).toBe('image/gif');
  expect(res.statusCode).toBe(200);
});

test('convert gif to jpeg', async () => {
  const response = await request(app)
    .post('/v1/fragments/')
    .auth('user1@email.com', 'password1')
    .set('Content-type', 'image/gif')
    .send(fs.readFileSync(`${__dirname}/testUploads/avocado.gif`));
  expect(response.status).toBe(201);

  const res = await request(app)
    .get(`/v1/fragments/${response.body.fragment.id}.jpg`)
    .auth('user1@email.com', 'password1');
  expect(res.type).toBe('image/jpeg');
  expect(res.statusCode).toBe(200);
});

test('convert jpeg to png', async () => {
  const response = await request(app)
    .post('/v1/fragments/')
    .auth('user1@email.com', 'password1')
    .set('Content-type', 'image/jpeg')
    .send(fs.readFileSync(`${__dirname}/testUploads/R.jpeg`));
  expect(response.status).toBe(201);

  const res = await request(app)
    .get(`/v1/fragments/${response.body.fragment.id}.png`)
    .auth('user1@email.com', 'password1');
  expect(res.type).toBe('image/png');
  expect(res.statusCode).toBe(200);
});
// end of region
describe('GET /v1/fragments/:id/info', () => {
  // if fragment does not exist, it should return 404
  test('non-existent fragment returns 404', async () => {
    const res = await request(app)
      .get(`/v1/fragments/:1234/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
  // if fragment exists, it should return a fragment metadata
  test('authenticated users get a fragment info', async () => {
    const response = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(`This is a fragment`);

    const res = await request(app)
      .get(`/v1/fragments/${response.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        type: expect.any(String),
        created: expect.any(String),
        updated: expect.any(String),
        size: expect.any(Number),
        ownerId: expect.any(String),
        id: expect.any(String),
      })
    );
  });
});
