"use client";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/alerts";

export default function GithubButton({ callbackURL }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
    const { error } = await authClient.signIn.social({ provider: "github", callbackURL });
    if (error) throw new Error(error.message || "GitHub login failed.");
    } catch (error) { toast("error", error.message || "GitHub login failed."); }
    finally { setBusy(false); }
  }
  return (
    <button type="button" disabled={busy} onClick={go} className="btn btn-outline w-full">
      <FaGithub aria-hidden /> Continue with GitHub
    </button>
  );
}
