"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { api } from "@/lib/api";
import { TYPES, TYPE_BLURB } from "@/lib/constants";
import { dayOf, fmtDate, monthOf } from "@/lib/format";
import EventCard from "@/components/EventCard";
import { GridSkeleton } from "@/components/Skeleton";

function NextEvent({ ev }) {
  return (
    <Link href={`/events/${ev._id}`} className="group block overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm">
      <div className="relative aspect-[16/10] bg-base-200">
        <img src={ev.thumbnail} alt={ev.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        <div className="absolute left-3 top-3 rounded-box bg-base-100 px-3 py-2 text-center leading-none shadow">
          <div className="font-display text-2xl font-bold">{dayOf(ev.eventDate)}</div>
          <div className="mt-1 text-xs">{monthOf(ev.eventDate)}</div>
        </div>
      </div>
      <div className="space-y-1 p-4">
        <p className="text-sm text-primary">Next up</p>
        <h2 className="text-xl font-bold group-hover:underline">{ev.title}</h2>
        <p className="flex items-center gap-2 text-sm opacity-80"><FiMapPin aria-hidden /> {ev.location}</p>
        <p className="flex items-center gap-2 text-sm opacity-80"><FiCalendar aria-hidden /> {fmtDate(ev.eventDate)}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/events?limit=7").then(setEvents).catch((e) => { setError(e.message); setEvents([]); });
  }, []);

  const [next, ...rest] = events || [];

  return (
    <>
      <section className="border-b border-base-300 bg-base-200">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Find a neighbourhood that needs your hands this week.</h1>
            <p className="mt-5 max-w-prose text-lg opacity-85">
              UnityHands lists cleanups, plantations, donation days, food drives and medical camps. Join one in a click, or organise your own and let neighbours sign up.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/events" className="btn btn-primary">Browse upcoming events</Link>
              <Link href="/create" className="btn btn-outline">Organise an event</Link>
            </div>
          </div>
          <div>
            {events === null ? <div className="skeleton h-80 w-full" /> : next ? <NextEvent ev={next} /> : (
              <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-8">
                <h2 className="text-xl font-bold">No upcoming events yet</h2>
                <p className="mt-2 opacity-80">Be the first to organise one and your neighbours can join it.</p>
                <Link href="/create" className="btn btn-primary btn-sm mt-4">Create an event</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Coming up soon</h2>
          <Link href="/events" className="link link-primary">See all events</Link>
        </div>
        {error && <p className="alert alert-error mb-4" role="alert">{error}</p>}
        {events === null ? <GridSkeleton count={6} /> : rest.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rest.map((ev) => <EventCard key={ev._id} ev={ev} />)}</div>
        ) : !error && <p className="opacity-80">More events will appear here as they are posted.</p>}
      </section>

      <section className="border-t border-base-300 bg-base-200">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">Ways to help</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TYPES.map((t) => (
              <Link key={t} href={`/events?type=${encodeURIComponent(t)}`} className="rounded-box border border-base-300 bg-base-100 p-4 hover:border-primary">
                <h3 className="font-bold">{t}</h3>
                <p className="mt-1 text-sm opacity-80">{TYPE_BLURB[t]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
