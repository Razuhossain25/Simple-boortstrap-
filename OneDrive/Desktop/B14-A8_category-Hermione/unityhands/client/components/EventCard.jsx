"use client";
import Link from "next/link";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { fmtDate } from "@/lib/format";

export default function EventCard({ ev }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-box border border-base-300 bg-base-100">
      <figure className="aspect-[16/10] bg-base-200">
        <img
          src={ev.thumbnail}
          alt={ev.title}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
        />
      </figure>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="badge badge-secondary badge-sm">{ev.eventType}</span>
        <h3 className="text-lg font-bold leading-snug">{ev.title}</h3>
        <p className="flex items-center gap-2 text-sm opacity-80"><FiCalendar aria-hidden /> {fmtDate(ev.eventDate)}</p>
        <p className="flex items-center gap-2 text-sm opacity-80"><FiMapPin aria-hidden /> {ev.location}</p>
        <Link href={`/events/${ev._id}`} className="btn btn-primary btn-sm mt-auto self-start">View details</Link>
      </div>
    </article>
  );
}
