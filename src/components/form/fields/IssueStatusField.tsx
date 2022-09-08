import { IssueStatus } from "@prisma/client";
import { startCase } from "lodash";
import Select from "react-select";
import { FieldProps, FieldWrapper } from "./FieldWrapper";
import { useReactSelectStyle } from "./useReactSelectStyle";

interface IssueStatusOption {
  label: string;
  value: IssueStatus | undefined;
}

export interface IssueStatusFieldProps extends FieldProps<IssueStatus> {
  /** The current status is shown as the first option with a "Keep Current Status XXX" message. */
  currentStatus: IssueStatus;
}

export function IssueStatusField({
  currentStatus,
  ...fieldProps
}: IssueStatusFieldProps) {
  const options = [
    {
      value: undefined,
      label: `Keep Current Status (${startCase(currentStatus)})`,
    },
    ...(Object.keys(IssueStatus) as IssueStatus[])
      .filter((it) => it !== currentStatus)
      .map((value) => ({
        value,
        label: startCase(value),
      })),
  ];

  const reactSelectStyle = useReactSelectStyle<IssueStatusOption>("w-[320px]");

  return (
    <FieldWrapper {...fieldProps}>
      {({ fieldProps: { value, onChange, ...fieldProps } }) => (
        <Select<IssueStatusOption>
          {...fieldProps}
          options={options}
          value={options.find((option) => option.value === value)}
          onChange={(option) => onChange(option?.value)}
          {...reactSelectStyle}
        />
      )}
    </FieldWrapper>
  );
}
