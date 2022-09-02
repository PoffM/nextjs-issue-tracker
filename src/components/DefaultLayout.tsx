import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";
import { ReactQueryDevtools } from "react-query/devtools";
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

      <div className="flex justify-center bg-gray-900 py-2">
        <div className="mx-2 flex w-full max-w-[1280px] items-center">
          <div className="flex-1"></div>
          <div className="flex flex-1 justify-center">
            <Link href="/">
              <a className="text-3xl font-bold">Issue Tracker</a>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            {session.status === "unauthenticated" && <LoginButton />}
            {session.status === "authenticated" && (
              <>
                <span>Logged in as {session.data.user?.name}</span>
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
