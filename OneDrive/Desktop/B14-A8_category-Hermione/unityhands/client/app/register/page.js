"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/alerts";
import { isEmail, isUrl } from "@/lib/validate";
import { safeNext } from "@/lib/safe-next";
import GithubButton from "@/components/GithubButton";

function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [v, setV] = useState({ name: "", email: "", image: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (v.name.trim().length < 2) found.name = "Enter your name.";
    if (!isEmail(v.email)) found.email = "Enter a valid email address.";
    if (v.image && !isUrl(v.image)) found.image = "Photo must be a valid URL, or leave it empty.";
    if (v.password.length < 8) found.password = "Password must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) found.password = "Use at least one letter and one number.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const { error } = await authClient.signUp.email({
      name: v.name.trim(),
      email: v.email.trim(),
      password: v.password,
      ...(v.image ? { image: v.image } : {}),
    });
    if (error) {
      toast("error", error.message || "Could not create your account.");
      setBusy(false);
      return;
    }
    toast("success", "Account created");
    router.push(next);
    router.refresh();
  }

  const field = (k, label, props = {}) => (
    <label className="form-control">
      <span className="label-text mb-1 font-medium">{label}</span>
      <input className="input input-bordered" value={v[k]} onChange={set(k)} {...props} />
      {errors[k] && <span className="mt-1 text-sm text-error" role="alert">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {field("name", "Name", { autoComplete: "name" })}
        {field("email", "Email", { type: "email", autoComplete: "email" })}
        {field("image", "Photo URL (optional)", { placeholder: "https://…" })}
        {field("password", "Password", { type: "password", autoComplete: "new-password" })}
        <button className="btn btn-primary w-full" disabled={busy}>{busy && <span className="loading loading-spinner loading-sm" />} Create account</button>
      </form>
      <div className="divider">or</div>
      <GithubButton callbackURL={next} />
      <p className="mt-6 text-sm">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="link link-primary">Log in</Link></p>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
