export default function Loader({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-[#e8e4df] bg-white shadow-md">
          <div className="aspect-[3/2] shimmer" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-20 shimmer rounded" />
            <div className="h-5 w-full shimmer rounded" />
            <div className="h-5 w-3/4 shimmer rounded" />
            <div className="h-3 w-full shimmer rounded" />
            <div className="h-3 w-2/3 shimmer rounded" />
            <div className="pt-3 border-t border-[#f0ece7] flex justify-between">
              <div className="h-3 w-24 shimmer rounded" />
              <div className="h-3 w-12 shimmer rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroLoader() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e8e4df] bg-white shadow-md">
      <div className="aspect-[21/9] shimmer" />
    </div>
  );
}
