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
import { Defined } from "../../utils/types";

/**
 * Links a form field to the form state.
 * Should be passed as a prop to form Field components.
 */
export interface FieldHandle<T> {
  name: string;
  useController: () => {
    fieldProps: {
      onChange: (newVal: T) => void;
      onBlur: () => void;
      value?: T;
      name: string;
      ref: RefCallBack;
    };
    fieldState: ControllerFieldState;
  };
}

/** Generic prop interface for form Field components. */
export interface FieldProps<T> {
  field: FieldHandle<T>;
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
        const {
          fieldState,
          field: { onBlur, value, ref, onChange },
        } = useController({ name, control: form.control });
        return {
          fieldProps: {
            name,
            onBlur,
            value,
            ref,
            onChange: (newVal) => onChange(newVal),
          },
          fieldState,
        };
      },
    };
  }

  return { ...form, field };
}
