import { signIn } from "next-auth/react";
import { ReactNode } from "react";

interface LoginButtonProps {
  children?: ReactNode;
}

export function LoginButton({ children }: LoginButtonProps) {
  return (
    <button className="btn btn-primary" onClick={() => void signIn("google")}>
      {children ?? "Login"}
    </button>
  );
}
