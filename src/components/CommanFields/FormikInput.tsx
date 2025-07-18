import React from "react";
import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormikInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  description?: string;
  options?: { label: string; value: string | boolean }[];
  step?: number;
  required?: boolean;
  disabled?: boolean;
  min?: number;
}
export const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  className,
  description,
  options,
  step,
  required,
  min,
  disabled,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && meta.error;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            id={name}
            placeholder={placeholder}
            className={`${hasError ? "border-red-500" : ""} !focus-visible:ring-0 !ring-0 !focus:border-primary focus-visible:border-primary ${className}`}
            {...field}
            {...props}
            disabled={disabled}
          />
        );

      case "select":
        return (
          <select
            id={name}
            className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-0 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${hasError ? "border-red-500" : ""
              } !focus-visible:ring-0 !ring-0 !focus:border-primary focus-visible:border-primary h-10 ${className}`}
            {...field}
            {...props}
            disabled={disabled}
          >
            <option value="" hidden>Select {placeholder || label}</option>
            {options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)} >
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={(checked) => {
                helpers.setValue(checked === true);
                // helpers.setTouched(true);
                // helpers
              }}
              {...props}
              disabled={disabled}
            />
            {
              label && (
                <Label
                  htmlFor={name}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              )
            }
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={String(field.value)}
            onValueChange={(val) => {
              helpers.setTouched(true);
              helpers.setValue(val === "true" ? true : val === "false" ? false : val);
            }}
            className="flex gap-8"
            disabled={disabled}
          >
            {options?.map((option) => (
              <div key={String(option.value)} className="flex items-center space-x-2">
                <RadioGroupItem
                  id={`${name}-${option.value}`}
                  value={String(option.value)}
                  required={required}
                />
                <Label htmlFor={`${name}-${option.value}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "number":
        return (
          <Input
            id={name}
            type="number"
            step={step || 1}
            min={min}
            placeholder={placeholder || "0"}
            className={`${hasError ? "border-red-500" : ""} !focus-visible:ring-0 !ring-0 !focus:border-primary focus-visible:border-primary h-10 ${className}`
            }
            {...field}
            {...props}
            disabled={disabled}
          />
        );

      case "file":
        return (
          <>
            <input
              type="file"
              id={name}
              name={name}
              disabled={disabled}
              className="w-full px-4 rounded-lg border border-[#d4d3d9]"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const file: File | undefined = event.currentTarget.files?.[0];
                helpers.setValue(file);
                // helpers.setTouched(true, true);
              }}
            />
          </>
        );

      default:
        return (
          <Input
            id={name}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            className={`${hasError ? "border-red-500" : ""} !focus-visible:ring-0 !ring-0 !focus:border-primary focus-visible:border-primary h-10 ${className}`}
            {...field}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-1" >
      {label && type !== "checkbox" && type !== "radio" && <Label className="text-color2 !mb-1.5 inline-block" htmlFor={name}> {label} {required && "*"} </Label>}
      {renderInput()}
      {description && <p className="text-xs text-gray-500" > {description} </p>}
      {hasError && <p className="text-xs text-red-500" > {meta.error} </p>}
    </div>
  );
};