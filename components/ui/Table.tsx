import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  minWidth = 820,
  className,
}: {
  headers: string[];
  children: ReactNode;
  minWidth?: number;
  className?: string;
}) {
  return (
    <div className={cn("table-scroll", className)}>
      <table
        className="w-full border-collapse"
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="th">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({
  colSpan,
  title,
  description,
}: {
  colSpan: number;
  title: string;
  description: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b-0 px-4 py-12 text-center">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1.5 text-xs text-muted">{description}</p>
      </td>
    </tr>
  );
}
