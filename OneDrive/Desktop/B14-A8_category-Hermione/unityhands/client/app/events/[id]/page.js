"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiCalendar, FiMapPin, FiUser } from "react-icons/fi";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { fmtDate } from "@/lib/format";
import { toast } from "@/lib/alerts";

export default function EventDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [ev, setEv] = useState(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/events/${id}`).then(setEv).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!session) { setJoined(false); return; }
    api("/joined-ids", { auth: true }).then((ids) => setJoined(ids.includes(id))).catch(() => {});
  }, [session, id]);

  async function join() {
    if (!session) return router.push(`/login?next=${encodeURIComponent(`/events/${id}`)}`);
    setBusy(true);
    try {
      await api(`/events/${id}/join`, { method: "POST", auth: true });
      setJoined(true);
      toast("success", "You joined this event");
    } catch (e) {
      if (/already joined/i.test(e.message)) setJoined(true);
      toast("error", e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <h1 className="text-3xl font-bold">Event not found</h1>
        <p className="mt-3 opacity-80">{error}</p>
        <Link href="/events" className="btn btn-primary mt-6">Browse upcoming events</Link>
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
        <div className="skeleton aspect-[16/10] w-full" />
        <div className="space-y-4"><div className="skeleton h-10 w-3/4" /><div className="skeleton h-5 w-1/2" /><div className="skeleton h-32 w-full" /></div>
      </div>
    );
  }

  const past = ev.eventDate <= new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
      <img src={ev.thumbnail} alt={ev.title} className="aspect-[16/10] w-full rounded-box bg-base-200 object-cover" />
      <div>
        <span className="badge badge-secondary">{ev.eventType}</span>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{ev.title}</h1>
        <ul className="mt-4 space-y-2 opacity-90">
          <li className="flex items-center gap-2"><FiCalendar aria-hidden /> {fmtDate(ev.eventDate)}</li>
          <li className="flex items-center gap-2"><FiMapPin aria-hidden /> {ev.location}</li>
          {ev.creatorName && <li className="flex items-center gap-2"><FiUser aria-hidden /> Organised by {ev.creatorName}</li>}
        </ul>
        <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed">{ev.description}</p>
        <div className="mt-8">
          {past ? <button className="btn btn-disabled" disabled>This event has passed</button>
            : joined ? <button className="btn btn-success" disabled>You have joined</button>
            : <button className="btn btn-primary" onClick={join} disabled={busy}>{busy && <span className="loading loading-spinner loading-sm" />} Join event</button>}
        </div>
        {!session && !past && <p className="mt-3 text-sm opacity-70">You’ll be asked to log in before joining.</p>}
      </div>
    </div>
  );
}
