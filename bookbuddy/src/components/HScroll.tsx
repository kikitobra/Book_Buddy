export default function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-2">{children}</div>
    </div>
  );
}
