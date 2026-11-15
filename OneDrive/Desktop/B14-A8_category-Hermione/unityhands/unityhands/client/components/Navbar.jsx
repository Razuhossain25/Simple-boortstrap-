"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";
import { toast } from "@/lib/alerts";

const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Upcoming events" },
];
const PRIVATE_LINKS = [
  { href: "/create", label: "Create event" },
  { href: "/manage", label: "Manage events" },
  { href: "/joined", label: "Joined events" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const user = session?.user;

  const active = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function logout() {
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || "Could not log out.");
      router.push("/");
      router.refresh();
      toast("success", "Logged out");
    } catch (error) { toast("error", error.message || "Could not log out. Please try again."); }
  }

  const links = (list) =>
    list.map((l) => (
      <li key={l.href}>
        <Link href={l.href} className={active(l.href) ? "font-semibold text-primary" : ""}>{l.label}</Link>
      </li>
    ));

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="navbar mx-auto max-w-6xl px-4">
        <div className="navbar-start min-w-0">
          <div className="dropdown xl:hidden">
            <button tabIndex={0} className="btn btn-ghost btn-sm btn-square" aria-label="Open menu"><FiMenu size={20} /></button>
            <ul tabIndex={0} className="menu dropdown-content z-40 mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow">
              {links(PUBLIC_LINKS)}
              {user && links(PRIVATE_LINKS)}
            </ul>
          </div>
          <Link href="/" className="shrink-0 font-display text-xl font-bold text-primary">UnityHands</Link>
        </div>

        <div className="navbar-center hidden xl:flex">
          <ul className="menu menu-horizontal gap-1 px-1">{links(PUBLIC_LINKS)}{user && links(PRIVATE_LINKS.slice(0, 3))}</ul>
        </div>

        <div className="navbar-end w-auto shrink-0 gap-1">
          <ThemeToggle />
          {isPending ? (
            <div className="skeleton h-8 w-8 rounded-full" />
          ) : user ? (
            <><button onClick={logout} className="btn btn-ghost btn-sm">Log out</button><div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-circle avatar" aria-label={`Account menu for ${user.name}`} title={user.name}>
                <div className="w-9 rounded-full bg-primary text-primary-content">
                  {user.image ? (
                    <img src={user.image} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-semibold">{(user.name || user.email)[0].toUpperCase()}</span>
                  )}
                </div>
              </button>
              <ul tabIndex={0} className="menu dropdown-content z-40 mt-3 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow">
                <li className="menu-title normal-case">
                  <span className="block truncate">{user.name}</span>
                  <span className="block truncate text-xs font-normal opacity-70">{user.email}</span>
                </li>
                {links(PRIVATE_LINKS)}
                <li><button onClick={logout}>Log out</button></li>
              </ul>
            </div></>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
