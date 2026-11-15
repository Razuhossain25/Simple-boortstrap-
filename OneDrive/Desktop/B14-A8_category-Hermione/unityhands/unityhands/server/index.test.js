import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';
import express from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { generateKeyPair, SignJWT, jwtVerify } from 'jose';

// Exercise the actual Express routes and JWT verification with isolated database fixtures.
test('event API: public browsing, JWT protection, ownership and joining', async (t) => {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA');
  const origin = 'http://unityhands.test';
  const rows = { events: [], joins: [] };
  const same = (a, b) => String(a) === String(b);
  const matches = (row, query) => Object.entries(query).every(([key, value]) => {
    if (key === '$or') return value.some((q) => matches(row, q));
    if (value instanceof RegExp) return value.test(row[key]);
    if (value?.$gt !== undefined) return row[key] > value.$gt;
    if (value?.$in) return value.$in.some((id) => same(row[key], id));
    return same(row[key], value);
  });
  const collection = (name) => ({
    async createIndex() {},
    find(query) {
      let found = rows[name].filter((row) => matches(row, query));
      return {
        sort(order) { const key = Object.keys(order)[0]; found.sort((a, b) => String(a[key]).localeCompare(String(b[key]))); return this; },
        limit(n) { found = found.slice(0, n); return this; },
        async toArray() { return found; },
      };
    },
    async findOne(query) { return rows[name].find((row) => matches(row, query)); },
    async insertOne(doc) {
      if (name === 'joins' && rows.joins.some((row) => row.eventId === doc.eventId && row.userEmail === doc.userEmail)) throw Object.assign(new Error('Duplicate'), { code: 11000 });
      const _id = new ObjectId(); rows[name].push({ ...doc, _id }); return { insertedId: _id };
    },
    async updateOne(query, update) { const row = rows[name].find((r) => matches(r, query)); if (row) Object.assign(row, update.$set); return { matchedCount: row ? 1 : 0 }; },
    async deleteOne(query) { const index = rows[name].findIndex((r) => matches(r, query)); if (index < 0) return { deletedCount: 0 }; rows[name].splice(index, 1); return { deletedCount: 1 }; },
    async deleteMany(query) { rows[name] = rows[name].filter((r) => !matches(r, query)); },
  });
  class MongoClient { async connect() {} db() { return { collection }; } }
  const source = (await readFile(new URL('./index.js', import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '').replace('export default app;', 'globalThis.testApp = app;');
  const context = { express, cors, MongoClient, ObjectId, URL, console, jwtVerify,
    createRemoteJWKSet: (url) => { assert.equal(String(url), `${origin}/api/auth/jwks`); return publicKey; },
    process: { env: { MONGODB_URI: 'mongodb://unused', CLIENT_URL: origin, VERCEL: '1' } },
  };
  vm.runInNewContext(source, context);
  const token = (email, options = {}) => new SignJWT({ email, name: email }).setProtectedHeader({ alg: 'EdDSA' }).setSubject(email).setIssuedAt().setExpirationTime(options.exp || '5m').setIssuer(options.issuer || origin).setAudience(options.audience || origin).sign(privateKey);
  const owner = await token('owner@example.com'); const other = await token('other@example.com');
  async function request(path, { method = 'GET', body, auth, raw } = {}) {
    // In-process HTTP streams avoid needing a listening port in restricted workspaces.
    const chunks = [];
    const socket = new Duplex({ read() {}, write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
    const req = new IncomingMessage(socket);
    req.method = method; req.url = path; req.complete = true;
    req.headers = { ...(auth ? { authorization: `Bearer ${auth}` } : {}) };
    const payload = raw || (body ? JSON.stringify(body) : undefined);
    if (payload) { req.headers['content-type'] = 'application/json'; req.headers['content-length'] = String(Buffer.byteLength(payload)); }
    const res = new ServerResponse(req); res.assignSocket(socket);
    const finished = new Promise((resolve, reject) => { res.on('finish', resolve); res.on('error', reject); });
    context.testApp.handle(req, res);
    if (payload) req.push(payload);
    req.push(null);
    await finished;
    const response = Buffer.concat(chunks).toString().split('\r\n\r\n').slice(1).join('\r\n\r\n');
    return { status: res.statusCode, body: JSON.parse(response) };
  }
  const event = { title: 'Mirpur cleanup', description: 'Help neighbours clean the park and sort collected waste.', location: 'Mirpur, Dhaka', eventType: 'Cleanup', thumbnail: 'https://example.com/photo.jpg', eventDate: '2099-12-20' };
  for (const [path, method] of [['/events', 'POST'], ['/my-events', 'GET'], ['/joined', 'GET'], ['/joined-ids', 'GET'], ['/events/000000000000000000000000', 'PUT'], ['/events/000000000000000000000000', 'DELETE'], ['/events/000000000000000000000000/join', 'POST']]) assert.equal((await request(path, { method, body: method === 'POST' || method === 'PUT' ? event : undefined })).status, 401);
  for (const bad of ['invalid', await token('owner@example.com', { issuer: 'http://wrong.test' }), await token('owner@example.com', { audience: 'wrong' }), await token('owner@example.com', { exp: '1 second ago' })]) assert.equal((await request('/my-events', { auth: bad })).status, 401);
  for (const body of [{ ...event, eventDate: '2099-02-30' }, { ...event, eventDate: '2020-01-01' }, { ...event, thumbnail: 'javascript:alert(1)' }, { ...event, title: 42 }]) assert.equal((await request('/events', { method: 'POST', auth: owner, body })).status, 400);
  assert.equal((await request('/events', { method: 'POST', auth: owner, raw: '{broken' })).status, 400);
  const created = await request('/events', { method: 'POST', auth: owner, body: { ...event, createdBy: 'other@example.com' } });
  assert.equal(created.status, 201); assert.equal(created.body.createdBy, 'owner@example.com');
  const id = created.body._id;
  assert.equal((await request(`/events/${id}`)).status, 200);
  assert.equal((await request('/events/invalid')).status, 404);
  assert.equal((await request('/my-events', { auth: other })).body.length, 0);
  assert.equal((await request(`/events/${id}`, { method: 'PUT', body: event, auth: other })).status, 403);
  assert.equal((await request(`/events/${id}`, { method: 'DELETE', auth: other })).status, 403);
  assert.equal((await request(`/events/${id}`, { method: 'PUT', auth: owner, body: { ...event, title: 'Updated cleanup' } })).status, 200);
  assert.equal((await request(`/events/${id}/join`, { method: 'POST', auth: other })).status, 201);
  assert.equal((await request(`/events/${id.toUpperCase()}/join`, { method: 'POST', auth: other })).status, 409);
  assert.equal((await request('/joined', { auth: other })).body.length, 1);
  assert.equal((await request('/joined', { auth: owner })).body.length, 0);
  for (let i = 0; i < 7; i++) await request('/events', { method: 'POST', auth: owner, body: { ...event, eventDate: `2099-12-${String(10 + i).padStart(2, '0')}` } });
  rows.events.push({ ...event, _id: new ObjectId(), eventDate: '2020-01-01' });
  const listing = (await request('/events?limit=6')).body;
  assert.equal(listing.length, 6); assert.equal(listing[0].eventDate, '2099-12-10');
  assert.ok((await request('/events')).body.every((row) => row.eventDate > '2020-01-01'));
  assert.equal((await request('/events?search=no-such-event')).body.length, 0);
  assert.equal((await request('/events?type=Donation')).body.length, 0);
  assert.equal((await request(`/events/${rows.events.at(-1)._id}/join`, { method: 'POST', auth: other })).status, 400);
  assert.equal((await request(`/events/${id}`, { method: 'DELETE', auth: owner })).status, 200);
  assert.equal((await request('/joined', { auth: other })).body.length, 0);
  assert.equal((await request(`/events/${id}`)).status, 404);
});
