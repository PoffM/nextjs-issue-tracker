import { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import "../../styles/globals.css";
import { ColorModeApplier } from "../components/color-mode/ColorModeApplier";
import { DefaultLayout } from "../components/DefaultLayout";
import { trpc } from "../utils/trpc";

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function IssueTrackerApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <SessionProvider>
      <ColorModeApplier />
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}

export default trpc.withTRPC(IssueTrackerApp);
