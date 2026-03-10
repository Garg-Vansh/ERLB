import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';

const app = express();
app.get('/api/health', (req, res) => res.json({ message: 'ok' }));

describe('Health endpoint', () => {
  it('returns healthy response', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('ok');
  });
});
