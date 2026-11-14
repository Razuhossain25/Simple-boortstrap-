"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { confirmDelete, toast } from "@/lib/alerts";
import { fmtDate } from "@/lib/format";
import EventForm from "@/components/EventForm";

export default function ManageEvents() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api("/my-events", { auth: true }).then(setEvents).catch((e) => { setError(e.message); setEvents([]); });
  useEffect(() => { load(); }, []);

  async function remove(ev) {
    if (!(await confirmDelete(ev.title))) return;
    try {
      await api(`/events/${ev._id}`, { method: "DELETE", auth: true });
      setEvents((list) => list.filter((e) => e._id !== ev._id));
      toast("success", "Event deleted");
    } catch (e) { toast("error", e.message); }
  }

  async function save(values) {
    setBusy(true);
    try {
      await api(`/events/${editing._id}`, { method: "PUT", body: values, auth: true });
      toast("success", "Event updated");
      setEditing(null);
      await load();
    } catch (e) { toast("error", e.message); }
    setBusy(false);
  }

  const past = (d) => d <= new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">Manage events</h1>
        <Link href="/create" className="btn btn-primary btn-sm">Create event</Link>
      </div>
      {error && <p className="alert alert-error mb-4" role="alert">{error}</p>}

      {events === null ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
      ) : events.length ? (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table">
            <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Location</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id}>
                  <td className="min-w-48 font-medium"><Link href={`/events/${ev._id}`} className="link link-hover">{ev.title}</Link></td>
                  <td>{ev.eventType}</td>
                  <td className="whitespace-nowrap">{fmtDate(ev.eventDate)} {past(ev.eventDate) && <span className="badge badge-ghost badge-sm ml-1">Past</span>}</td>
                  <td>{ev.location}</td>
                  <td className="whitespace-nowrap text-right">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(ev)}>Update</button>
                    <button className="btn btn-ghost btn-sm text-error" onClick={() => remove(ev)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error && (
        <div className="rounded-box border border-dashed border-base-300 p-10 text-center">
          <h2 className="text-xl font-bold">You haven’t created any events</h2>
          <p className="mt-2 opacity-80">Events you organise will show up here so you can update or delete them.</p>
          <Link href="/create" className="btn btn-primary btn-sm mt-4">Create your first event</Link>
        </div>
      )}

      {editing && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Update event">
          <div className="modal-box max-w-2xl">
            <h2 className="mb-4 text-2xl font-bold">Update event</h2>
            <EventForm initial={editing} submitLabel="Save changes" busy={busy} onSubmit={save} />
            <button className="btn btn-ghost btn-sm mt-3" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <div className="modal-backdrop" onClick={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}
