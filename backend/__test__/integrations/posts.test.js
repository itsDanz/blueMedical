import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

const realFetch = globalThis.fetch;

function isExternalPostsUrl(input) {
  const url = typeof input === 'string' ? input : input && input.url;
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.pathname.endsWith('/api/v1/posts');
  } catch {
    return false;
  }
}

describe('GET /posts (integration)', function () {
  this.timeout(10000);

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('returns aggregated counts per user', async () => {
    globalThis.fetch = (input, init) => {
      if (isExternalPostsUrl(input)) {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            { name: 'Alice', comment: 'hello', id: '1' },
            { name: 'Bob',   comment: 'hi',    id: '2' },
            { name: 'Alice', comment: 'again', id: '3' },
            { name: '', comment: 'invalid', id: '4' }
          ])
        });
      }
      return realFetch(input, init);
    };

    const res = await request(app).get('/posts').expect(200);
    const body = res.body;
    expect(Array.isArray(body)).to.equal(true);

    const alice = body.find(r => r.name === 'Alice');
    const bob   = body.find(r => r.name === 'Bob');
    expect(alice?.postCount).to.equal(2);
    expect(bob?.postCount).to.equal(1);
  });

  it('returns 500 if external API fails', async () => {
    globalThis.fetch = (input, init) => {
      if (isExternalPostsUrl(input)) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: 'boom' })
        });
      }
      return realFetch(input, init);
    };

    await request(app).get('/posts').expect(500);
  });
});
