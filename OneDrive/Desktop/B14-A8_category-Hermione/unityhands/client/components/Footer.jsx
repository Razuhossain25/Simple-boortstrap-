import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p><span className="font-display text-base font-bold text-primary">UnityHands</span> brings neighbours together for community service.</p>
        <nav className="flex gap-4">
          <Link href="/events" className="link link-hover">Upcoming events</Link>
          <Link href="/create" className="link link-hover">Create an event</Link>
        </nav>
      </div>
    </footer>
  );
}
