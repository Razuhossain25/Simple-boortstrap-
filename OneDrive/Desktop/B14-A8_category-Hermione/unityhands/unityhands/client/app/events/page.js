"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { api } from "@/lib/api";
import { TYPES } from "@/lib/constants";
import EventCard from "@/components/EventCard";
import { GridSkeleton } from "@/components/Skeleton";

function Events() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [type, setType] = useState(params.get("type") || "all");
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setEvents(null);
    setError("");
    const t = setTimeout(() => {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("search", search.trim());
      if (type !== "all") qs.set("type", type);
      api(`/events?${qs}`, { signal: controller.signal }).then(setEvents).catch((e) => { if (!controller.signal.aborted) { setError(e.message); setEvents([]); } });
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [search, type]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Upcoming events</h1>
      <p className="mt-2 opacity-80">Events that have already happened are hidden automatically.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="input input-bordered flex flex-1 items-center gap-2">
          <FiSearch aria-hidden />
          <input type="search" className="grow" placeholder="Search by title or location" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search events" />
        </label>
        <select className="select select-bordered sm:w-52" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by event type">
          <option value="all">All event types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="mt-8">
        {error && <p className="alert alert-error mb-4" role="alert">{error}</p>}
        {events === null ? <GridSkeleton count={6} /> : events.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map((ev) => <EventCard key={ev._id} ev={ev} />)}</div>
        ) : !error && (
          <div className="rounded-box border border-dashed border-base-300 p-10 text-center">
            <h2 className="text-xl font-bold">No events match</h2>
            <p className="mt-2 opacity-80">Try a different search or event type, or organise one yourself.</p>
            <Link href="/create" className="btn btn-primary btn-sm mt-4">Create an event</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10"><GridSkeleton /></div>}><Events /></Suspense>;
}
