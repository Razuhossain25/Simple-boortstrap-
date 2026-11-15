"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Wait for the persisted session before mounting pages that load private data.
export function withAuth(Page) {
  function ProtectedPage(props) {
    const { data: session, isPending, error, refetch } = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
      if (!isPending && !session && !error) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }, [isPending, session, error, pathname, router]);
    if (error) return <div className="mx-auto max-w-lg px-4 py-16"><p className="alert alert-error" role="alert">We could not check your session. Please try again.</p><button className="btn btn-primary mt-4" onClick={() => refetch()}>Try again</button></div>;
    if (isPending || !session) return <div className="mx-auto max-w-6xl space-y-4 px-4 py-10" role="status" aria-label="Checking your session"><div className="skeleton h-10 w-56" /><div className="skeleton h-64 w-full" /><span className="sr-only">Checking your session…</span></div>;
    return <Page key={session.user.id} {...props} />;
  }
  ProtectedPage.displayName = `Protected(${Page.name || "Page"})`;
  return ProtectedPage;
}
