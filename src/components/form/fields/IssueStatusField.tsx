import { IssueStatus } from "@prisma/client";
import { IoMdArrowDropdown } from "react-icons/io";
import { FieldProps } from "../useTypeForm";

export function IssueStatusField({ field }: FieldProps<IssueStatus>) {
  const {
    fieldProps: { onChange, value, ...buttonProps },
  } = field.useController();

  function labelText(status: IssueStatus) {
    return status.replace("_", " ");
  }

  return (
    <div className="dropdown">
      <button
        type="button"
        tabIndex={0}
        className="btn w-36 justify-around"
        {...buttonProps}
      >
        {value && labelText(value)} <IoMdArrowDropdown size="20px" />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 bg-base-200 p-2 shadow"
      >
        {(Object.keys(IssueStatus) as IssueStatus[]).map((option) => (
          <li key={option}>
            <button
              type="button"
              onClick={(e) => {
                onChange(option);
                (e.target as HTMLButtonElement).blur();
              }}
            >
              {labelText(option)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
