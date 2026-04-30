export default function IndicatorsLoading() {
  return (
    <main className="min-h-screen bg-black">
      <div className="h-16 border-b border-white/5 bg-black/60 backdrop-blur-md" />
      <div className="px-6 pt-28 pb-20">
        <div className="mx-auto max-w-6xl text-center space-y-5">
          <div className="mx-auto h-5 w-32 rounded-full bg-white/5 animate-pulse" />
          <div className="mx-auto h-14 w-3/4 rounded-xl bg-white/5 animate-pulse" />
          <div className="mx-auto h-14 w-1/2 rounded-xl bg-white/5 animate-pulse" />
          <div className="mx-auto h-5 w-64 rounded bg-white/5 animate-pulse mt-4" />
          <div className="mx-auto h-12 w-40 rounded-full bg-white/5 animate-pulse mt-6" />
        </div>
      </div>
    </main>
  );
}
