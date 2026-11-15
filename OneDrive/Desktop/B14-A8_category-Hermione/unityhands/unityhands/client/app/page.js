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
    api("/events?limit=6").then(setEvents).catch((e) => { setError(e.message); setEvents([]); });
  }, []);

  const next = events?.[0];

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
        {events === null ? <GridSkeleton count={6} /> : events.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map((ev) => <EventCard key={ev._id} ev={ev} />)}</div>
        ) : !error && <p className="opacity-80">More events will appear here as they are posted.</p>}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl font-bold sm:text-3xl">Small actions, shared progress</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            ["Find your local cause", "Browse upcoming opportunities by location and event type to find a cause close to home."],
            ["Bring people together", "Create a community event and keep its details up to date as your plans take shape."],
            ["Keep track of your plans", "Join an event and find all your volunteering commitments together, sorted by date."],
          ].map(([title, text]) => <article key={title} className="rounded-box border border-base-300 p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-relaxed opacity-80">{text}</p></article>)}
        </div>
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
      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" className="text-2xl font-bold sm:text-3xl">Community in action</h2>
        <p className="mt-3 max-w-prose leading-relaxed opacity-80">Every helping hand makes a difference. A glimpse of the care, teamwork and generosity that inspire our community.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["photo-1532629345422-7515f3d16bb9", "People coming together to support a community cause", "Showing up for one another"],
            ["photo-1542601906990-b4d3fb778b09", "Hands caring for a young green plant", "Growing a greener neighbourhood"],
            ["photo-1488521787991-ed7bbaae773c", "Community members sharing a moment together", "Building lasting connections"],
          ].map(([image, alt, caption]) => <figure key={image} className="overflow-hidden rounded-box border border-base-300 bg-base-100"><img src={`https://images.unsplash.com/${image}?w=800&auto=format&fit=crop&q=80`} alt={alt} loading="lazy" className="aspect-[4/3] w-full object-cover" /><figcaption className="p-4 font-semibold">{caption}</figcaption></figure>)}
        </div>
      </section>

      <section className="border-t border-base-300 bg-base-200" aria-labelledby="newsletter-heading">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2 md:items-center">
          <div><h2 id="newsletter-heading" className="text-2xl font-bold sm:text-3xl">A little inspiration for your inbox</h2><p className="mt-3 leading-relaxed opacity-80">Our community newsletter will share local opportunities and stories of neighbours making a difference.</p></div>
          <div><label htmlFor="newsletter-email" className="mb-2 block font-medium">Email address</label><div className="flex flex-col gap-3 sm:flex-row"><input id="newsletter-email" type="email" placeholder="you@example.com" className="input input-bordered min-w-0 flex-1" aria-describedby="newsletter-note" /><button type="button" className="btn btn-primary" disabled>Subscribe soon</button></div><p id="newsletter-note" className="mt-3 text-sm opacity-70">Subscriptions are coming soon. No email addresses are collected yet.</p></div>
        </div>
      </section>
    </>
  );
}
