"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";
import { trpc } from "../utils/trpc";
import { ColorModeApplier } from "./color-mode/ColorModeApplier";

export const AppProviders = trpc.withTRPC(function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <SessionProvider>
      <ColorModeApplier />
      {children}
    </SessionProvider>
  );
});
