export default function Loader({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
          <div className="aspect-[16/10] shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-20 shimmer rounded" />
            <div className="h-5 w-full shimmer rounded" />
            <div className="h-5 w-3/4 shimmer rounded" />
            <div className="h-3 w-1/2 shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroLoader() {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
      <div className="aspect-[21/9] shimmer" />
    </div>
  );
}
