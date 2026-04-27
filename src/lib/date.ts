import { format, parse, isValid } from "date-fns";

/** Parse backend date string "dd-MM-yyyy" -> Date | null */
export function parseApiDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = parse(value, "dd-MM-yyyy", new Date());
  return isValid(d) ? d : null;
}

/** Format Date -> "dd-MM-yyyy" for backend */
export function formatApiDate(date: Date): string {
  return format(date, "dd-MM-yyyy");
}

/** Pretty display: "12 Mar 2025" */
export function formatDisplayDate(value?: string | null): string {
  const d = parseApiDate(value ?? undefined);
  return d ? format(d, "d MMM yyyy") : "—";
}