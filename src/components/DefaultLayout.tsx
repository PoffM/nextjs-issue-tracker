import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";
import { ReactQueryDevtools } from "react-query/devtools";
import { ColorModeToggleButton } from "./color-mode/ColorModeToggleButton";
import { LoginButton } from "./LoginButton";

type DefaultLayoutProps = { children: ReactNode };

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const session = useSession();

  return (
    <div className="fixed inset-0 flex flex-col gap-8 overflow-y-auto">
      <Head>
        <title>Issue Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-center bg-base-300 py-2">
        <div className="mx-2 flex w-full max-w-[1280px] items-center">
          <div className="flex-1">
            <ColorModeToggleButton />
          </div>
          <div className="flex flex-1 justify-center">
            <Link href="/">
              <a className="text-3xl font-bold">Issue Tracker</a>
            </Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-end gap-2 sm:flex-row">
            {session.status === "unauthenticated" && <LoginButton />}
            {session.status === "authenticated" && (
              <>
                <div className="text-center">
                  Logged in as {session.data.user?.name}
                </div>
                <button
                  className="btn btn-outline btn-secondary"
                  onClick={() => void signOut()}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-2 flex grow justify-center">
        <div className="w-full max-w-[1280px]">{children}</div>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <div className="fixed">
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      )}
    </div>
  );
}
