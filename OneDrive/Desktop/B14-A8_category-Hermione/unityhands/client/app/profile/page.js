"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/alerts";
import { isUrl } from "@/lib/validate";

export default function Profile() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name || ""); setImage(user.image || ""); }
  }, [user]);

  async function save(e) {
    e.preventDefault();
    const found = {};
    if (name.trim().length < 2) found.name = "Enter your name.";
    if (image && !isUrl(image)) found.image = "Photo must be a valid URL, or leave it empty.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const { error } = await authClient.updateUser({ name: name.trim(), image: image || null });
    setBusy(false);
    if (error) toast("error", error.message || "Could not update your profile.");
    else toast("success", "Profile updated");
  }

  if (isPending || !user) {
    return <div className="mx-auto max-w-lg px-4 py-10"><div className="skeleton h-72 w-full" /></div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <div className="mt-6 flex items-center gap-4">
        <div className="avatar">
          <div className="w-20 rounded-full bg-primary text-primary-content">
            {image && isUrl(image) ? <img src={image} alt="" referrerPolicy="no-referrer" /> : <span className="flex h-full items-center justify-center text-3xl font-semibold">{(user.name || user.email)[0].toUpperCase()}</span>}
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{user.name}</p>
          <p className="truncate opacity-70">{user.email}</p>
        </div>
      </div>
      <form onSubmit={save} noValidate className="mt-6 space-y-4">
        <label className="form-control">
          <span className="label-text mb-1 font-medium">Name</span>
          <input className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <span className="mt-1 text-sm text-error" role="alert">{errors.name}</span>}
        </label>
        <label className="form-control">
          <span className="label-text mb-1 font-medium">Photo URL</span>
          <input className="input input-bordered" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
          {errors.image && <span className="mt-1 text-sm text-error" role="alert">{errors.image}</span>}
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy && <span className="loading loading-spinner loading-sm" />} Save changes</button>
      </form>
    </div>
  );
}
