import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-3 opacity-80">That link doesn’t lead anywhere. It may have been moved or deleted.</p>
      <Link href="/events" className="btn btn-primary mt-6">Browse upcoming events</Link>
    </div>
  );
}
