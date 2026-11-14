"use client";
import { useState } from "react";
import { TYPES, tomorrow } from "@/lib/constants";
import { validateEvent } from "@/lib/validate";

const EMPTY = { title: "", description: "", eventType: "", location: "", thumbnail: "", eventDate: "" };

export default function EventForm({ initial, submitLabel, busy, onSubmit }) {
  const [v, setV] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const found = validateEvent(v);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit(v);
  }

  const field = (k, label, input) => (
    <label className="form-control w-full">
      <span className="label-text mb-1 font-medium">{label}</span>
      {input}
      {errors[k] && <span className="mt-1 text-sm text-error" role="alert">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {field("title", "Event title", <input className="input input-bordered" value={v.title} onChange={set("title")} placeholder="Riverside cleanup" />)}
      {field("description", "Description", <textarea className="textarea textarea-bordered h-28" value={v.description} onChange={set("description")} placeholder="What will volunteers do, and what should they bring?" />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("eventType", "Event type",
          <select className="select select-bordered" value={v.eventType} onChange={set("eventType")}>
            <option value="" disabled>Choose a type</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>)}
        {field("eventDate", "Event date", <input type="date" min={tomorrow()} className="input input-bordered" value={v.eventDate} onChange={set("eventDate")} />)}
      </div>
      {field("location", "Location", <input className="input input-bordered" value={v.location} onChange={set("location")} placeholder="Mirpur 10, Dhaka" />)}
      {field("thumbnail", "Thumbnail image URL", <input className="input input-bordered" value={v.thumbnail} onChange={set("thumbnail")} placeholder="https://…" />)}
      <button className="btn btn-primary" disabled={busy}>
        {busy && <span className="loading loading-spinner loading-sm" />} {submitLabel}
      </button>
    </form>
  );
}
