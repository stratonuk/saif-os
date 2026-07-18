import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function FormSelect({
  label,
  name,
  defaultValue,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <FormField label={label}>
      <NativeSelect
        name={name}
        {...(value !== undefined ? { value } : { defaultValue })}
        options={options}
        onChange={onChange}
      />
    </FormField>
  );
}
