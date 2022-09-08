import { VscError } from "react-icons/vsc";

export interface ErrorAlertProps {
  error?: {
    message: string;
  } | null;
}

/** Renders an error message in a red alert box. */
export function ErrorAlert({ error }: ErrorAlertProps) {
  return error ? (
    <div className="alert alert-error shadow-lg">
      <div>
        <VscError size="25px" />
        <span>{error?.message}</span>
      </div>
    </div>
  ) : null;
}
