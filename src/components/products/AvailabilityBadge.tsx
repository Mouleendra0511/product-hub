import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AvailabilityBadge({
  available,
  quantity,
}: {
  available: boolean;
  quantity?: number;
}) {
  const outOfStock = !available || (quantity !== undefined && quantity <= 0);
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        outOfStock
          ? "bg-destructive/10 text-destructive"
          : "bg-success/15 text-success",
      )}
    >
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          outOfStock ? "bg-destructive" : "bg-success",
        )}
      />
      {outOfStock ? "Out of stock" : "Available"}
    </Badge>
  );
}