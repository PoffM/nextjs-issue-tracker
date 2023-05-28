"use client";

import { signOut, useSession } from "next-auth/react";
import { LoginButton } from "./LoginButton";

/** Displays either the "Login" button or the "Logged in as {username}" message. */
export function NavbarUserSection() {
  const session = useSession();

  return session.status === "unauthenticated" ? (
    <LoginButton />
  ) : session.status === "authenticated" ? (
    <>
      <div className="text-center">Logged in as {session.data.user?.name}</div>
      <button
        className="btn-outline btn-secondary btn"
        onClick={() => void signOut()}
      >
        Logout
      </button>
    </>
  ) : null;
}
