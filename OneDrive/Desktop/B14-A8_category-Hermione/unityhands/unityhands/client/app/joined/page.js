"use client";
import { withAuth } from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import EventCard from "@/components/EventCard";
import { GridSkeleton } from "@/components/Skeleton";

function Joined() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/joined", { auth: true }).then(setEvents).catch((e) => { setError(e.message); setEvents([]); });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Joined events</h1>
      <p className="mt-2 opacity-80">Sorted by date, soonest first.</p>
      <div className="mt-8">
        {error && <p className="alert alert-error mb-4" role="alert">{error}</p>}
        {events === null ? <GridSkeleton count={3} /> : events.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map((ev) => <EventCard key={ev._id} ev={ev} />)}</div>
        ) : !error && (
          <div className="rounded-box border border-dashed border-base-300 p-10 text-center">
            <h2 className="text-xl font-bold">You haven’t joined any events yet</h2>
            <p className="mt-2 opacity-80">Find something near you and join it.</p>
            <Link href="/events" className="btn btn-primary btn-sm mt-4">Browse upcoming events</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(Joined);
