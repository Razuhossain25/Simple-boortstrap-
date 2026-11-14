import "dotenv/config";
import { MongoClient } from "mongodb";
const email = process.env.SEED_EMAIL || "organiser@unityhands.example";
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const img = (id) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop&q=80`;
const base = [
  ["Winter Blanket and Warm Clothes Distribution", "Donation", "Mohammadpur, Dhaka", "photo-1532629345422-7515f3d16bb9", "Hand out blankets and warm clothing packs to families facing the winter cold. Volunteers sort, pack and deliver on foot."],
  ["Mirpur Neighbourhood Cleanup", "Cleanup", "Mirpur 10, Dhaka", "photo-1618477461853-cf6ed80faba5", "Clear litter from the park and drainage paths, and set up waste-sorting bins. Gloves and bags are provided."],
  ["Urban Tree Plantation Drive", "Plantation", "Dhanmondi Lake Area, Dhaka", "photo-1542601906990-b4d3fb778b09", "Plant 500 native saplings along the lakeside and nearby school boundaries. Bring water and a hat."],
  ["Free Community Medical Camp", "Medical Camp", "Uttara Sector 7, Dhaka", "photo-1584515979956-d9f6e5d09982", "Free health checkups, blood sugar screening and basic medicines for elderly residents, run by volunteer doctors."],
  ["Food Pack Distribution for Daily Earners", "Food Drive", "Tejgaon Industrial Area, Dhaka", "photo-1488521787991-ed7bbaae773c", "Pack and distribute monthly rations of rice, lentils and cooking oil to daily wage earners and their families."],
  ["Children's Digital Literacy Day", "Donation", "Gulshan Community Center, Dhaka", "photo-1531482615713-2afd69097998", "Donate used laptops and teach basic computer skills to children from underprivileged backgrounds."],
];
if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI in server/.env first.");
  process.exit(1);
}
const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const col = c.db(process.env.DB_NAME || "unityhands").collection("events");
// Re-running the seed replaces the previous sample events instead of duplicating them.
await col.deleteMany({ createdBy: email, creatorName: "UnityHands Team" });
await col.insertMany(base.map(([title, eventType, location, id, description], i) => ({
  title, eventType, location, description, thumbnail: img(id), eventDate: day(7 + i * 5),
  createdBy: email, creatorName: "UnityHands Team", createdAt: new Date(),
})));
console.log("Seeded 6 events for", email);
await c.close();
