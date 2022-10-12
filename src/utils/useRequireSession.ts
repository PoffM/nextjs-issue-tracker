import { useSession } from "next-auth/react";

/** Require the user to be logged in, otherwise redirect to the login page. */
export function useRequireSession() {
  return useSession({
    required: true,
    /**
     * Custom login page redirect code because next-auth's "signIn" function
     * causes a redirect loop if you press the back button on the login page.
     */
    onUnauthenticated() {
      const callbackUrl = encodeURIComponent(window.location.href);
      /**
       * Remove the current page from the browser history so clicking the
       * Back button on the login page doesn't redirect you again to the login page.
       */
      window.location.replace(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    },
  });
}
