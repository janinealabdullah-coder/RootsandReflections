import { useFamily } from "@/hooks/use-family";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FamilySwitcher = () => {
  const { family, families, switchFamily } = useFamily();

  if (families.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Switch family
        <ChevronDown className="w-3.5 h-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {families.map((f) => (
          <DropdownMenuItem
            key={f.familyId}
            onClick={() => switchFamily(f.familyId)}
            className={f.familyId === family?.familyId ? "font-bold bg-accent" : ""}
          >
            {f.familyName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FamilySwitcher;
