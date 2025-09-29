"use client";
type Props = { items: string[]; value: string; onChange: (v: string) => void };
export default function PillTabs({ items, value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-auto py-1">
      {items.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-full text-sm border
            ${value === t ? "border-neon.mint text-neon.mint bg-neon.mint/10" : "border-line text-white/70 hover:text-white"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
