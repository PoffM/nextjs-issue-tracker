import { IssueStatus } from "@prisma/client";
import { startCase } from "lodash";
import Select from "react-select";
import { FieldProps, FieldWrapper } from "./FieldWrapper";
import { useReactSelectStyle } from "./useReactSelectStyle";

interface IssueStatusOption {
  label: string;
  value: IssueStatus;
}

export function IssueStatusField(fieldProps: FieldProps<IssueStatus>) {
  const options = (Object.keys(IssueStatus) as IssueStatus[]).map((value) => ({
    value,
    label: startCase(value),
  }));

  const reactSelectStyle = useReactSelectStyle<IssueStatusOption>("w-[170px]");

  return (
    <FieldWrapper {...fieldProps}>
      {({ fieldProps: { value, onChange, ...fieldProps } }) => (
        <Select<IssueStatusOption>
          {...fieldProps}
          options={options}
          value={options.find((option) => option.value === value)}
          onChange={(option) => option?.value && onChange(option.value)}
          {...reactSelectStyle}
        />
      )}
    </FieldWrapper>
  );
}
