import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

const CLIENT_URL = (process.env.CLIENT_URL || "").replace(/\/+$/, "");
if (!CLIENT_URL) console.warn("CLIENT_URL is not set: CORS and JWT verification will fail.");



// Express 4 does not catch errors thrown in async handlers; this forwards them to the error handler.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
let events, joins, databaseReady;
async function db() {
  if (!databaseReady) databaseReady = (async () => {
    await client.connect();
    const d = client.db(process.env.DB_NAME || "unityhands");
    const eventCollection = d.collection("events");
    const joinCollection = d.collection("joins");
    await joinCollection.createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
    events = eventCollection;
    joins = joinCollection;
  })().catch((error) => { databaseReady = null; throw error; });
  await databaseReady;
}
app.use(async (_req, _res, next) => { try { await db(); next(); } catch (e) { next(e); } });

// JWT: verified against BetterAuth's JWKS endpoint on the client app
let JWKS;
const getJWKS = () => (JWKS ||= createRemoteJWKSet(new URL(`${CLIENT_URL}/api/auth/jwks`)));
async function verifyJWT(req, res, next) {
  try {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || "");
    if (!match) throw new Error("Missing bearer token");
    const { payload } = await jwtVerify(match[1], getJWKS(), {
      issuer: CLIENT_URL, audience: CLIENT_URL, requiredClaims: ["exp", "sub", "email"],
    });
    if (typeof payload.email !== "string" || !payload.email.trim()) throw new Error("Missing token identity");
    req.user = { email: payload.email, name: payload.name };
    next();
  } catch {
    res.status(401).json({ message: "Please log in again. Your session could not be verified." });
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const TYPES = ["Cleanup", "Plantation", "Donation", "Food Drive", "Medical Camp"];
const text = (value, minimum = 1) => typeof value === "string" && value.trim().length >= minimum;
function validate(body) {
  const b = body || {};
  if (!text(b.title, 5)) return "Title must be at least 5 characters.";
  if (!text(b.description, 20)) return "Description must be at least 20 characters.";
  if (!TYPES.includes(b.eventType)) return "Choose a valid event type.";
  if (!text(b.location)) return "Location is required.";
  try {
    if (typeof b.thumbnail !== "string" || !["http:", "https:"].includes(new URL(b.thumbnail).protocol)) throw new Error();
  } catch { return "Thumbnail must be an HTTP or HTTPS image URL."; }
  if (typeof b.eventDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.eventDate)) return "Enter a valid event date.";
  const date = new Date(`${b.eventDate}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== b.eventDate) return "Enter a valid event date.";
  if (b.eventDate <= today()) return "Event date must be in the future.";
  return null;
}
const pick = (b) => ({
  title: b.title.trim(), description: b.description.trim(), eventType: b.eventType,
  location: b.location.trim(), thumbnail: b.thumbnail, eventDate: b.eventDate,
});
const oid = (id) => { try { return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : null; } catch { return null; } };

// Upcoming events (public). ?limit=6 &search= &type=
app.get("/events", ah(async (req, res) => {
  const q = { eventDate: { $gt: today() } };
  if (req.query.type && req.query.type !== "all") q.eventType = req.query.type;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    q.$or = [{ title: rx }, { location: rx }];
  }
  let cur = events.find(q).sort({ eventDate: 1 });
  const limit = parseInt(req.query.limit);
  if (limit > 0) cur = cur.limit(limit);
  res.json(await cur.toArray());
}));

app.get("/events/:id", ah(async (req, res) => {
  const _id = oid(req.params.id);
  const ev = _id && (await events.findOne({ _id }));
  if (!ev) return res.status(404).json({ message: "Event not found." });
  res.json(ev);
}));

app.post("/events", verifyJWT, ah(async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const doc = { ...pick(req.body), createdBy: req.user.email, creatorName: req.user.name, createdAt: new Date() };
  const r = await events.insertOne(doc);
  res.status(201).json({ ...doc, _id: r.insertedId });
}));

app.get("/my-events", verifyJWT, ah(async (req, res) =>
  res.json(await events.find({ createdBy: req.user.email }).sort({ eventDate: 1 }).toArray())));

app.put("/events/:id", verifyJWT, ah(async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event ID." });
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const r = await events.updateOne({ _id, createdBy: req.user.email }, { $set: pick(req.body) });
  if (!r.matchedCount) return res.status(403).json({ message: "You can only update events you created." });
  res.json({ ok: true });
}));

app.delete("/events/:id", verifyJWT, ah(async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid event ID." });
  const r = await events.deleteOne({ _id, createdBy: req.user.email });
  if (!r.deletedCount) return res.status(403).json({ message: "You can only delete events you created." });
  await joins.deleteMany({ eventId: _id.toHexString() });
  res.json({ ok: true });
}));

app.post("/events/:id/join", verifyJWT, ah(async (req, res) => {
  const _id = oid(req.params.id);
  const ev = _id && (await events.findOne({ _id }));
  if (!ev) return res.status(404).json({ message: "Event not found." });
  if (ev.eventDate <= today()) return res.status(400).json({ message: "This event has already passed." });
  try {
    await joins.insertOne({ eventId: _id.toHexString(), userEmail: req.user.email, userName: req.user.name, joinedAt: new Date() });
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "You have already joined this event." });
    throw e;
  }
}));

app.get("/joined", verifyJWT, ah(async (req, res) => {
  const mine = await joins.find({ userEmail: req.user.email }).toArray();
  const ids = mine.map((j) => oid(j.eventId)).filter(Boolean);
  res.json(await events.find({ _id: { $in: ids } }).sort({ eventDate: 1 }).toArray());
}));

app.get("/joined-ids", verifyJWT, ah(async (req, res) =>
  res.json((await joins.find({ userEmail: req.user.email }).toArray()).map((j) => j.eventId))));

app.get("/", (_q, res) => res.json({ name: "UnityHands API", status: "ok" }));
app.use((_req, res) => res.status(404).json({ message: "API route not found." }));
app.use((e, _q, res, _n) => {
  if (e.type === "entity.parse.failed") return res.status(400).json({ message: "Request body must be valid JSON." });
  console.error(e);
  res.status(500).json({ message: "Something went wrong on the server." });
});

if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log("API running"));
export default app;
