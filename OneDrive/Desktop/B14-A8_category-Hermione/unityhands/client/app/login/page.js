"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/alerts";
import { isEmail } from "@/lib/validate";
import { safeNext } from "@/lib/safe-next";
import GithubButton from "@/components/GithubButton";

function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [v, setV] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!isEmail(v.email)) found.email = "Enter a valid email address.";
    if (!v.password) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const { error } = await authClient.signIn.email({ email: v.email.trim(), password: v.password });
    if (error) {
      toast("error", error.message || "Email or password is incorrect.");
      setBusy(false);
      return;
    }
    toast("success", "Logged in");
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Log in</h1>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <label className="form-control">
          <span className="label-text mb-1 font-medium">Email</span>
          <input type="email" autoComplete="email" className="input input-bordered" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
          {errors.email && <span className="mt-1 text-sm text-error" role="alert">{errors.email}</span>}
        </label>
        <label className="form-control">
          <span className="label-text mb-1 font-medium">Password</span>
          <input type="password" autoComplete="current-password" className="input input-bordered" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
          {errors.password && <span className="mt-1 text-sm text-error" role="alert">{errors.password}</span>}
        </label>
        <button className="btn btn-primary w-full" disabled={busy}>{busy && <span className="loading loading-spinner loading-sm" />} Log in</button>
      </form>
      <div className="divider">or</div>
      <GithubButton callbackURL={next} />
      <p className="mt-6 text-sm">New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="link link-primary">Create an account</Link></p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
