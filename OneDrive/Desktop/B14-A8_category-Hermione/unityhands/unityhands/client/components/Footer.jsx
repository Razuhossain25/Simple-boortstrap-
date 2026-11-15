import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div><Link href="/" className="font-display text-xl font-bold text-primary">UnityHands</Link><p className="mt-3 max-w-xs text-sm leading-relaxed opacity-80">Bring neighbours together for cleaner streets, greener spaces and a community where everyone can lend a hand.</p></div>
        <nav aria-label="Community links"><h2 className="font-bold">Get involved</h2><ul className="mt-3 space-y-2 text-sm"><li><Link href="/events" className="link link-hover">Upcoming events</Link></li><li><Link href="/create" className="link link-hover">Organise an event</Link></li><li><Link href="/joined" className="link link-hover">Your joined events</Link></li></ul></nav>
        <div><h2 className="font-bold">Make your time count</h2><p className="mt-3 text-sm leading-relaxed opacity-80">Choose a cause near you, check the event details and connect with your neighbours through service.</p><Link href="/register" className="btn btn-primary btn-sm mt-4">Join the community</Link></div>
      </div>
      <div className="border-t border-base-300 px-4 py-4 text-center text-xs opacity-70">© {new Date().getFullYear()} UnityHands. Every helping hand matters.</div>
    </footer>
  );
}
