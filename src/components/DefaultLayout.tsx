import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { ReactNode } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

type DefaultLayoutProps = { children: ReactNode };

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const { status } = useSession();

  return (
    <div className="flex flex-col gap-8">
      <Head>
        <title>Issue Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex items-center px-8 py-2 bg-gray-900">
        <div className="flex-1"></div>
        <div className="flex flex-1 justify-center text-3xl font-bold">
          Issue Tracker
        </div>
        <div className="flex flex-1 justify-end">
          {status === "unauthenticated" && (
            <button
              className="btn btn-primary"
              onClick={() => void signIn("google")}
            >
              Login
            </button>
          )}
          {status === "authenticated" && (
            <button
              className="btn btn-outline btn-secondary"
              onClick={() => void signOut()}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[1280px]">{children}</div>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </div>
  );
}
