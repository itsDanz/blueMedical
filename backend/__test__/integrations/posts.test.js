import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { EXTERNAL_API_URL } from '../../src/config.js';

const realFetch = globalThis.fetch;

const matchesExternal = (input) => {
  const url = typeof input === 'string' ? input : input?.url;
  return !!(url && url.startsWith(EXTERNAL_API_URL));
};

describe('GET /posts (integration)', function () {
  this.timeout(10000);
  afterEach(() => { globalThis.fetch = realFetch; });

  it('returns aggregated counts per user', async () => {
    globalThis.fetch = (input, init) => {
      if (matchesExternal(input)) {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            { name: 'Alice', comment: 'x' },
            { name: 'Bob',   comment: 'y' },
            { name: 'Alice', comment: 'z' },
          ])
        });
      }
      return realFetch(input, init);
    };

    const res = await request(app).get('/posts').expect(200);
    const body = res.body;
    expect(body.find(r => r.name === 'Alice')?.postCount).to.equal(2);
    expect(body.find(r => r.name === 'Bob')?.postCount).to.equal(1);
  });

  it('returns 500 if external API fails', async () => {
    globalThis.fetch = (input, init) => {
      if (matchesExternal(input)) {
        return Promise.resolve({ ok: false, status: 500, json: async () => ({ error: 'boom' }) });
      }
      return realFetch(input, init);
    };

    await request(app).get('/posts').expect(500);
  });
});
