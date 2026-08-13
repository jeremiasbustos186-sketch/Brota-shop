export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="bg-gray-200 h-4 rounded w-3/4" />
        <div className="bg-gray-200 h-3 rounded w-1/2" />
        <div className="bg-gray-200 h-6 rounded w-1/3" />
      </div>
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
}

export function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
