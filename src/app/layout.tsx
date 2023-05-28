import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";
import { LayoutProps } from "../../.next/types/app/layout";
import "../../styles/globals.css";
import { AppProviders } from "../components/AppProviders";
import { ColorModeToggleButton } from "../components/color-mode/ColorModeToggleButton";
import { NavbarUserSection } from "../components/login/NavbarUserSection";

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Issue Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AppProviders>
          <div className="fixed inset-0 flex flex-col gap-8 overflow-y-auto">
            <div className="flex justify-center bg-base-300 py-2">
              <div className="mx-2 flex w-full max-w-[1280px] items-center">
                <div className="flex-1">
                  <ColorModeToggleButton />
                </div>
                <div className="flex flex-1 justify-center">
                  <Link className="text-3xl font-bold" href="/">
                    Issue Tracker
                  </Link>
                </div>
                <div className="flex flex-1 flex-col items-center justify-end gap-2 sm:flex-row sm:gap-4">
                  <a
                    href="https://github.com/PoffM/nextjs-issue-tracker"
                    className="hover:link"
                  >
                    <div className="flex items-center gap-1">
                      <AiFillGithub size="25px" />
                      Github Repo
                    </div>
                  </a>
                  <NavbarUserSection />
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
        </AppProviders>
      </body>
    </html>
  );
}
