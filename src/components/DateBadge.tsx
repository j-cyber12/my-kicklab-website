"use client";

type Props = {
  date?: Date | string;
  prefix?: string;
};

export default function DateBadge({ date, prefix = "Updated" }: Props) {
  const d = date ? new Date(date) : new Date();
  const formatted = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);

  return (
    <div className="mt-2">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-token text-[11px] tracking-wide">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="uppercase text-zinc-600 dark:text-zinc-400">{prefix}</span>
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatted}</span>
      </span>
    </div>
  );
}

