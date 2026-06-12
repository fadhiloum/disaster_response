"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/app/lib/data";

export function SessionControls({
  currentUser,
  users,
}: {
  currentUser: User | null;
  users: User[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState(currentUser?.email ?? users[0]?.email ?? "");
  const [isPending, setIsPending] = useState(false);

  async function login() {
    setIsPending(true);

    try {
      await fetch("/api/auth/login", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function logout() {
    setIsPending(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-md border border-[#d8e0f3] bg-[#f5f7fb] px-3 py-2 text-right lg:mt-5 lg:text-left">
      {currentUser ? (
        <>
          <p className="text-sm font-semibold text-zinc-900">
            {currentUser.name}
          </p>
          <p className="text-xs text-zinc-500">{currentUser.role}</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-zinc-900">Not signed in</p>
          <p className="text-xs text-zinc-500">Sign in to save changes</p>
        </>
      )}
      <div className="mt-3 flex flex-col gap-2">
        <select
          className="min-h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700"
          disabled={isPending}
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        >
          {users.map((user) => (
            <option key={user.id} value={user.email}>
              {user.name} - {user.role}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            className="min-h-9 flex-1 rounded-md bg-[#244a9b] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !email}
            onClick={login}
            type="button"
          >
            Sign in
          </button>
          <button
            className="min-h-9 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !currentUser}
            onClick={logout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
