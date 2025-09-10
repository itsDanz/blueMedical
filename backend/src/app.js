import express from 'express';
import cors from 'cors';
import { EXTERNAL_API_URL } from './config.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.type('text/plain').send('OK');
});

/**
 * Obtiene los posts desde el API
 * @returns {Promise<Array<{createdAt:string,name:string,comment:string,id:string}>>}
 */
async function fetchExternalPosts() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const resp = await fetch(EXTERNAL_API_URL, { signal: controller.signal });
    if (!resp.ok) {
      throw new Error(`External API responded ${resp.status}`);
    }
    const data = await resp.json();
    if (!Array.isArray(data)) {
      throw new Error('External API payload is not an array');
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Agrega por nombre y cuenta posts válidos
 * @param {Array} posts
 * @returns {Array<{name:string,postCount:number}>}
 */

function aggregateByUser(posts) {
  const counts = new Map();
  for (const p of posts) {
    if (!p || !p.name || typeof p.name !== 'string' || !p.name.trim()) continue;
    const key = p.name.trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, postCount]) => ({ name, postCount }));
}

app.get('/posts', async (_req, res) => {
  try {
    const posts = await fetchExternalPosts();
    const aggregated = aggregateByUser(posts);
    return res.json(aggregated);
  } catch (err) {
    return res.status(500).json({ error: 'External API failed' });
  }
});

export default app;
