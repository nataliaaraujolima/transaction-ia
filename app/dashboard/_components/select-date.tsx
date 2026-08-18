import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/shared/_components/ui/select";
import { MONTH_OPTIONS } from "../_constants/chart-config";

export function SelectDate() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um mês" />
      </SelectTrigger>
      <SelectContent>
        {MONTH_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
