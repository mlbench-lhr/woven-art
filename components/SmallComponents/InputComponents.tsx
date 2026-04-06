import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import DeadlinePicker from "../ui/datePicker";

interface BaseInputProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

// Form-controlled versions
interface FormInputProps<T extends FieldValues> {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  control: Control<T>;
  name: FieldPath<T>;
}

// Regular Select Component (non-form)
export const SelectInputComponent = ({
  label,
  placeholder,
  options,
  disabled = false,
  required = false,
  value,
  onChange,
  error,
}: BaseInputProps & {
  options?: string[] | number[];
}) => {
  return (
    <div className="space-y-1 col-span-1">
      <Label className="text-[14px] font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          className={`w-full ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
          style={{ height: "44px" }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {options?.map((item) => (
            <SelectItem key={item} value={item as string}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Form-controlled Select Component
export function FormSelectInput<T extends FieldValues>({
  label,
  placeholder,
  options,
  disabled = false,
  required = false,
  control,
  name,
}: FormInputProps<T> & {
  options?: string[] | number[];
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <SelectInputComponent
          label={label}
          placeholder={placeholder}
          options={options}
          disabled={disabled}
          required={required}
          value={field.value}
          onChange={field.onChange}
          error={error?.message}
        />
      )}
    />
  );
}

// Regular Text Input Component (non-form)
export const TextInputComponent = ({
  label,
  placeholder,
  disabled = false,
  required = false,
  value,
  onChange,
  type = "text",
  error,
  max,
}: BaseInputProps & {
  type?: "text" | "email" | "number" | "tel" | "password" | "date";
  max?: string;
}) => {
  const placeholderTemp = placeholder || "Enter " + label;
  return (
    <div className="space-y-1 col-span-1">
      <Label className="text-[14px] font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {type === "date" ? (
        <div
          className={`overflow-hidden flex justify-start items-center h-[36px] file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F3F3] md:text-xs ${
            error ? "border-red-500" : ""
          }`}
        >
          <DeadlinePicker
            date={value}
            setDate={(val: string) => onChange?.(val)}
            onRemove={() => onChange?.("")}
            textClass={" text-[14px] "}
            maxDate={max ? new Date(max) : undefined}
            disabled={disabled}
          />
        </div>
      ) : (
        <Input
          max={max}
          type={type}
          placeholder={placeholderTemp}
          className={`bg-white ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
          required={required}
          disabled={disabled}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export const TextAreaInputComponent = ({
  label,
  placeholder,
  disabled = false,
  required = false,
  value,
  onChange,
  type = "text",
  error,
}: BaseInputProps & {
  type?: "text" | "email" | "number" | "tel" | "password" | "date";
}) => {
  const placeholderTemp = placeholder || "Enter " + label;
  return (
    <div className="space-y-1 col-span-1">
      <Label className="text-[14px] font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        placeholder={placeholderTemp}
        className={`h-[44px] bg-white ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
        required={required}
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Form-controlled Text Input Component
export function FormTextInput<T extends FieldValues>({
  label,
  placeholder,
  disabled = false,
  required = false,
  control,
  name,
  type = "text",
}: FormInputProps<T> & {
  type?: "text" | "email" | "number" | "tel" | "password" | "date";
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        type === "date" ? (
          <div className="space-y-1 col-span-1">
            <Label className="text-[14px] font-semibold">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div
              className={`overflow-hidden flex justify-start items-center h-[36px] file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F3F3] md:text-xs ${
                error ? "border-red-500" : ""
              }`}
            >
              <DeadlinePicker
                date={field.value}
                setDate={(val: string) => field.onChange(val)}
                onRemove={() => field.onChange("")}
                textClass={" text-[14px] "}
                disabled={disabled}
              />
            </div>
            {error?.message && (
              <p className="text-sm text-red-500 mt-1">{error.message}</p>
            )}
          </div>
        ) : (
          <TextInputComponent
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            type={type}
            value={field.value}
            onChange={field.onChange}
            error={error?.message}
          />
        )
      )}
    />
  );
}

export function FormTextAreaInput<T extends FieldValues>({
  label,
  placeholder,
  disabled = false,
  required = false,
  control,
  name,
  type = "text",
}: FormInputProps<T> & {
  type?: "text" | "email" | "number" | "tel" | "password" | "date";
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextAreaInputComponent
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          type={type}
          value={field.value}
          onChange={field.onChange}
          error={error?.message}
        />
      )}
    />
  );
}

// Regular Radio Input Component (non-form)
export const RadioInputComponent = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
}) => {
  return (
    <div className="space-y-2 col-span-1">
      <Label className="text-[14px] font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-14 flex-col md:flex-row justify-start items-end mt-4 flex-wrap"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Form-controlled Radio Input Component
export function FormRadioInput<T extends FieldValues>({
  label,
  options,
  required = false,
  control,
  name,
}: {
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  control: Control<T>;
  name: FieldPath<T>;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <RadioInputComponent
          label={label}
          options={options}
          required={required}
          value={field.value}
          onChange={field.onChange}
          error={error?.message}
        />
      )}
    />
  );
}

// Regular File Input Component (non-form)
export const FileInputComponent = ({
  label,
  placeholder,
  disabled = false,
  required = false,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (file: File | null) => void;
  error?: string;
}) => {
  const placeholderTemp = placeholder || "Choose file";
  return (
    <div className="space-y-1 col-span-1">
      <Label className="text-[14px] font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type="file"
        placeholder={placeholderTemp}
        className={`h-[44px] bg-white cursor-pointer ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.files?.[0] || null)}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Form-controlled File Input Component
export function FormFileInput<T extends FieldValues>({
  label,
  placeholder,
  disabled = false,
  required = false,
  control,
  name,
}: {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  control: Control<T>;
  name: FieldPath<T>;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...field }, fieldState: { error } }) => (
        <FileInputComponent
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          error={error?.message}
        />
      )}
    />
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface FileInputProps {
  label: string;
  onFileSelect: (file: string) => void;
  files?: string[];
  onFileRemove?: (index: number) => void;
  error?: string;
  required?: boolean;
  accept?: string;
}

export function FileInput({
  label,
  onFileSelect,
  files = [],
  onFileRemove,
  error,
  required,
  accept = "image/*,.pdf",
}: FileInputProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      alert("File size should be less than 25MB.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onFileSelect(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[14px] font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <Input
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept={accept}
          className="cursor-pointer"
        />
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded files:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-2 rounded"
            >
              <span className="text-sm truncate">File {index + 1}</span>
              {onFileRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
