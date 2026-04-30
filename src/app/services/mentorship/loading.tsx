export default function MentorshipLoading() {
  return (
    <main className="min-h-screen bg-black">
      <div className="h-16 border-b border-white/5 bg-black/60 backdrop-blur-md" />
      <div className="px-6 pt-28 pb-20">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-12 items-start">
          <div className="max-w-xl w-full space-y-4">
            <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-white/5 animate-pulse" />
            <div className="h-14 w-4/5 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-4 w-48 rounded bg-white/5 animate-pulse mt-2" />
            <div className="h-12 w-36 rounded-full bg-white/5 animate-pulse mt-4" />
          </div>
          <div className="w-full max-w-lg aspect-video rounded-xl bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    </main>
  );
}
