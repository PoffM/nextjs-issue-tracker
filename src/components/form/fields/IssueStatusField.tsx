import { IssueStatus } from "@prisma/client";
import { startCase } from "lodash";
import Select from "react-select";
import { FieldProps, FieldWrapper } from "./FieldWrapper";

export function IssueStatusField(fieldProps: FieldProps<IssueStatus>) {
  const options = (Object.keys(IssueStatus) as IssueStatus[]).map((value) => ({
    value,
    label: startCase(value),
  }));

  return (
    <FieldWrapper {...fieldProps}>
      {({ fieldProps: { value, onChange, ...fieldProps } }) => (
        <Select
          {...fieldProps}
          options={options}
          value={options.find((option) => option.value === value)}
          onChange={(option) => option?.value && onChange(option.value)}
          className="w-[170px]"
        />
      )}
    </FieldWrapper>
  );
}
