import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../_components/ui/tooltip";

export const SelectTransaction = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipContent>
          <p>Funcinalidade em desenvolvimento, aguarde.</p>
        </TooltipContent>
        <TooltipTrigger className="w-full sm:w-auto">
          <Select disabled>
            <SelectTrigger className="h-8 w-full px-2 text-xs sm:w-auto">
              <SelectValue placeholder="Tipo de transação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="bank">Bancária</SelectItem>
            </SelectContent>
          </Select>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
