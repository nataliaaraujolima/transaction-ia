"use client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/_components/ui/select";
import { MONTH_OPTIONS } from "../_constants/chart-config";

interface SelectDateProps {
  month: string;
}

export function SelectDate({ month }: SelectDateProps) {
  const { push } = useRouter();

  return (
    <Select
      items={MONTH_OPTIONS}
      value={month}
      onValueChange={(value) => {
        if (value) push(`/dashboard?month=${value}`);
      }}
    >
      <SelectTrigger className="w-full sm:w-auto">
        <SelectValue placeholder="Selecione um mês">
          {(value: string | null) =>
            MONTH_OPTIONS.find((option) => option.value === value)?.label ?? "Selecione um mês"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MONTH_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
