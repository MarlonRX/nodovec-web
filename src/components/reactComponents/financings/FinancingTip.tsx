import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Tooltip de ayuda reutilizable para el módulo de financiamientos. */
export function FinancingTip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="Info" className="inline-flex size-5 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:text-(--accent-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)/50 ml-1 shrink-0">
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-55 text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
