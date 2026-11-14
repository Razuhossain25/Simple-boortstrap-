"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "@/lib/alerts";
import EventForm from "@/components/EventForm";

export default function CreateEvent() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create(values) {
    setBusy(true);
    try {
      const ev = await api("/events", { method: "POST", body: values, auth: true });
      toast("success", "Event created");
      router.push(`/events/${ev._id}`);
    } catch (e) {
      toast("error", e.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Create an event</h1>
      <p className="mb-6 mt-2 opacity-80">Neighbours can find it under Upcoming events and join in one click.</p>
      <EventForm submitLabel="Create event" busy={busy} onSubmit={create} />
    </div>
  );
}
