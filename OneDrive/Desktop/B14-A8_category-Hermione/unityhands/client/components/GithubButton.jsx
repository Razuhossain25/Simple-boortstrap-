"use client";
import { FaGithub } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/alerts";

export default function GithubButton({ callbackURL }) {
  async function go() {
    const { error } = await authClient.signIn.social({ provider: "github", callbackURL });
    if (error) toast("error", error.message || "GitHub login failed.");
  }
  return (
    <button type="button" onClick={go} className="btn btn-outline w-full">
      <FaGithub aria-hidden /> Continue with GitHub
    </button>
  );
}
