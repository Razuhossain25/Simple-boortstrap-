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
let events, joins;
async function db() {
  if (!events) {
    await client.connect();
    const d = client.db(process.env.DB_NAME || "unityhands");
    events = d.collection("events");
    joins = d.collection("joins");
    await joins.createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
  }
}
app.use(async (_req, _res, next) => { try { await db(); next(); } catch (e) { next(e); } });

// JWT: verified against BetterAuth's JWKS endpoint on the client app
let JWKS;
const getJWKS = () => (JWKS ||= createRemoteJWKSet(new URL(`${CLIENT_URL}/api/auth/jwks`)));
async function verifyJWT(req, res, next) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const { payload } = await jwtVerify(token, getJWKS());
    req.user = { email: payload.email, name: payload.name };
    next();
  } catch {
    res.status(401).json({ message: "Please log in again. Your session could not be verified." });
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const TYPES = ["Cleanup", "Plantation", "Donation", "Food Drive", "Medical Camp"];
function validate(b) {
  if (!b.title || b.title.trim().length < 5) return "Title must be at least 5 characters.";
  if (!b.description || b.description.trim().length < 20) return "Description must be at least 20 characters.";
  if (!TYPES.includes(b.eventType)) return "Choose a valid event type.";
  if (!b.location || !b.location.trim()) return "Location is required.";
  try { new URL(b.thumbnail); } catch { return "Thumbnail must be a valid image URL."; }
  if (!b.eventDate || b.eventDate <= today()) return "Event date must be in the future.";
  return null;
}
const pick = (b) => ({
  title: b.title.trim(), description: b.description.trim(), eventType: b.eventType,
  location: b.location.trim(), thumbnail: b.thumbnail, eventDate: b.eventDate,
});
const oid = (id) => { try { return new ObjectId(id); } catch { return null; } };

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
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const r = await events.updateOne({ _id, createdBy: req.user.email }, { $set: pick(req.body) });
  if (!r.matchedCount) return res.status(403).json({ message: "You can only update events you created." });
  res.json({ ok: true });
}));

app.delete("/events/:id", verifyJWT, ah(async (req, res) => {
  const _id = oid(req.params.id);
  const r = await events.deleteOne({ _id, createdBy: req.user.email });
  if (!r.deletedCount) return res.status(403).json({ message: "You can only delete events you created." });
  await joins.deleteMany({ eventId: req.params.id });
  res.json({ ok: true });
}));

app.post("/events/:id/join", verifyJWT, ah(async (req, res) => {
  const _id = oid(req.params.id);
  const ev = _id && (await events.findOne({ _id }));
  if (!ev) return res.status(404).json({ message: "Event not found." });
  if (ev.eventDate <= today()) return res.status(400).json({ message: "This event has already passed." });
  try {
    await joins.insertOne({ eventId: req.params.id, userEmail: req.user.email, userName: req.user.name, joinedAt: new Date() });
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
app.use((e, _q, res, _n) => { console.error(e); res.status(500).json({ message: "Something went wrong on the server." }); });

if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log("API running"));
export default app;
