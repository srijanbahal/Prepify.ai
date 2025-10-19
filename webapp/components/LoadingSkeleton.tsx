export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-dark-200 rounded-lg w-64 animate-pulse"></div>
          <div className="h-4 bg-dark-200 rounded-lg w-48 animate-pulse"></div>
        </div>
        <div className="h-10 bg-dark-200 rounded-lg w-32 animate-pulse"></div>
      </div>

      {/* Card skeleton */}
      <div className="card-border">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-dark-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 bg-dark-200 rounded-lg w-48 animate-pulse"></div>
              <div className="h-4 bg-dark-200 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-dark-200 rounded-lg w-full animate-pulse"></div>
            <div className="h-4 bg-dark-200 rounded-lg w-3/4 animate-pulse"></div>
            <div className="h-4 bg-dark-200 rounded-lg w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="card-border">
            <div className="card p-6 space-y-4">
              <div className="h-5 bg-dark-200 rounded-lg w-32 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-dark-200 rounded-lg w-full animate-pulse"></div>
                <div className="h-4 bg-dark-200 rounded-lg w-5/6 animate-pulse"></div>
                <div className="h-4 bg-dark-200 rounded-lg w-4/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
