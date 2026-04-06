import { ReactNode } from "react";
import { useForm, Controller, FieldValues, Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type ValidationRule = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  validate?: Record<string, (value: any) => boolean | string>;
};

export type FormField = {
  name: string;
  label?: string;
  type?:
    | "text"
    | "email"
    | "number"
    | "date"
    | "tel"
    | "select"
    | "radio"
    | "custom";
  placeholder?: string;
  validation?: ValidationRule;
  options?: string[] | { value: string; label: string }[];
  component?: (props: {
    value: any;
    onChange: (value: any) => void;
    error?: string;
  }) => ReactNode;
  disabled?: boolean;
};

export type FormValidationProviderProps<T extends FieldValues> = {
  fields: FormField[];
  defaultValues: T;
  onSubmit: (data: T) => void | Promise<void>;
  submitButtonText?: string;
  submitButtonVariant?: string;
  submitButtonClassName?: string;
  children?: (renderProps: {
    renderField: (fieldName: string) => ReactNode;
    control: any;
    errors: any;
    watch: any;
  }) => ReactNode;
};

export function FormValidationProvider<T extends FieldValues>({
  fields,
  defaultValues,
  onSubmit,
  submitButtonText = "Next",
  submitButtonVariant = "main_green_button",
  submitButtonClassName = "w-full md:w-[235px]",
  children,
}: FormValidationProviderProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<T>({
    defaultValues,
    mode: "onChange",
  });

  const renderField = (fieldName: string) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return null;

    return (
      <Controller
        name={field.name as Path<T>}
        control={control}
        rules={field.validation}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          if (field.component) {
            return (
              <div className="space-y-1">
                {field.label && (
                  <Label className="text-[14px] font-semibold">
                    {field.label}
                    {field.validation?.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                )}
                {field.component({ value, onChange, error: error?.message })}
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </div>
            );
          }

          switch (field.type) {
            case "select":
              return (
                <div className="space-y-1">
                  {field.label && (
                    <Label className="text-[14px] font-semibold">
                      {field.label}
                      {field.validation?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  )}
                  <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={field.disabled}
                    className={`w-full px-3 py-2 border rounded-md ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {field.placeholder || "Select an option"}
                    </option>
                    {field.options?.map((opt, idx) => {
                      const optValue =
                        typeof opt === "string" ? opt : opt.value;
                      const optLabel =
                        typeof opt === "string" ? opt : opt.label;
                      return (
                        <option key={idx} value={optValue}>
                          {optLabel}
                        </option>
                      );
                    })}
                  </select>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              );

            case "radio":
              return (
                <div className="space-y-2">
                  {field.label && (
                    <Label className="text-[14px] font-semibold">
                      {field.label}
                      {field.validation?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  )}
                  <div className="flex flex-col gap-2">
                    {field.options?.map((opt, idx) => {
                      const optValue =
                        typeof opt === "string" ? opt : opt.value;
                      const optLabel =
                        typeof opt === "string" ? opt : opt.label;
                      return (
                        <label
                          key={idx}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={optValue}
                            checked={value === optValue}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={field.disabled}
                            className="cursor-pointer"
                          />
                          <span>{optLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              );

            default:
              return (
                <div className="space-y-1">
                  {field.label && (
                    <Label className="text-[14px] font-semibold">
                      {field.label}
                      {field.validation?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  )}
                  <input
                    type={field.type || "text"}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className={`w-full px-3 py-2 border rounded-md ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              );
          }
        }}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {children ? (
        children({ renderField, control, errors, watch })
      ) : (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>{renderField(field.name)}</div>
          ))}
        </div>
      )}
      <div className={`mt-4 ${submitButtonClassName}`}>
        <Button
          type="submit"
          variant={submitButtonVariant as any}
          className="w-full"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
