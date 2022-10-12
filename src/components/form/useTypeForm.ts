import {
  ControllerFieldState,
  FieldPath,
  FieldValues,
  PathValue,
  RefCallBack,
  useController,
  useForm,
  UseFormProps,
} from "react-hook-form";
import { Defined } from "../../utils/util-types";

/**
 * Links a form field to the form state.
 * Should be passed as a prop to form Field components.
 */
export interface FieldHandle<T> {
  name: string;
  useController: () => FieldController<T>;
}

export interface FieldController<T> {
  fieldProps: {
    /** Improved type safety over react-hook-form's onChange type: "(...event: any[]) => void" */
    onChange: (newVal: T | undefined) => void;
    onBlur: () => void;
    value?: T;
    name: string;
    ref: RefCallBack;
  };
  fieldState: ControllerFieldState;
}

/**
 * Wrapper around react-hook-form's useForm for better type safety on field names and types.
 *
 * @example
 * ```
 * const { field } = useForm<{ post: string }>();
 *
 * const fieldHandle = field("post"); // Type-safe "post" key which returns a FieldHandle<string>.
 *
 * // The field's value and onChange properties are type-safe:
 * const value: string = fieldHandle.fieldProps.value;
 * fieldHandle.fieldProps.onChange("My post");
 *
 * // Typical usage in a form component:
 * return <TextField field={form.field("post")} />
 * ```
 */
export function useTypeForm<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormProps<TFieldValues>
) {
  const form = useForm<TFieldValues, FieldValues>(props);

  function field<Key extends FieldPath<TFieldValues>>(
    name: Key
  ): FieldHandle<Defined<PathValue<TFieldValues, Key>>> {
    return {
      name,
      useController: () => {
        const { fieldState, field: fieldProps } = useController({
          name,
          control: form.control,
        });

        return { fieldProps, fieldState };
      },
    };
  }

  return { ...form, field };
}
