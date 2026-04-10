function Box({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-28 w-28 ${className}`} />
      <span className="max-w-28 text-center text-xs text-zinc-400">{label}</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-zinc-100">
      <h1 className="mb-2 text-2xl font-bold">squircle Demo</h1>
      <p className="mb-8 text-zinc-400">
        Comparing regular rounded corners with squircle corners at different radii.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Small radius</h2>
          <div className="flex gap-6">
            <Box label="rounded-lg" className="rounded-lg bg-indigo-600" />
            <Box
              label="rounded-lg + corner-shape"
              className="raw-superellipse rounded-lg bg-amber-600"
            />
            <Box label="squircle-lg" className="squircle-lg bg-pink-600" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Medium radius</h2>
          <div className="flex gap-6">
            <Box label="rounded-2xl" className="rounded-2xl bg-indigo-600" />
            <Box
              label="rounded-2xl + corner-shape"
              className="raw-superellipse rounded-2xl bg-amber-600"
            />
            <Box label="squircle-2xl" className="squircle-2xl bg-pink-600" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Large radius</h2>
          <div className="flex gap-6">
            <Box label="rounded-3xl" className="rounded-3xl bg-indigo-600" />
            <Box
              label="rounded-3xl + corner-shape"
              className="raw-superellipse rounded-3xl bg-amber-600"
            />
            <Box label="squircle-3xl" className="squircle-3xl bg-pink-600" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">
            Squircle amount (squircle-amt-*)
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Controls the superellipse exponent. Higher = more square. Default is 2.
          </p>
          <div className="flex flex-wrap gap-6">
            <Box
              label="squircle-3xl squircle-amt-1"
              className="squircle-amt-1 squircle-3xl bg-emerald-600"
            />
            <Box
              label="squircle-3xl squircle-amt-1.5"
              className="squircle-amt-1.5 squircle-3xl bg-emerald-600"
            />
            <Box label="squircle-3xl (default 2)" className="squircle-3xl bg-emerald-600" />
            <Box
              label="squircle-3xl squircle-amt-3"
              className="squircle-amt-3 squircle-3xl bg-emerald-600"
            />
            <Box
              label="squircle-3xl squircle-amt-5"
              className="squircle-amt-5 squircle-3xl bg-emerald-600"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Per-corner squircles</h2>
          <div className="flex flex-wrap gap-6">
            <Box label="squircle-tl-3xl" className="squircle-tl-3xl bg-violet-600" />
            <Box label="squircle-tr-3xl" className="squircle-tr-3xl bg-violet-600" />
            <Box label="squircle-br-3xl" className="squircle-br-3xl bg-violet-600" />
            <Box label="squircle-bl-3xl" className="squircle-bl-3xl bg-violet-600" />
            <Box label="squircle-t-3xl" className="squircle-t-3xl bg-violet-600" />
            <Box label="squircle-b-3xl" className="squircle-b-3xl bg-violet-600" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Per-corner squircles</h2>
          <div className="flex flex-wrap gap-6">
            <Box label="squircle-s-3xl" className="squircle-s-3xl bg-violet-600" />
            <Box label="squircle-e-3xl" className="squircle-e-3xl bg-violet-600" />
            <Box label="squircle-se-3xl" className="squircle-se-3xl bg-violet-600" />
            <Box label="squircle-es-3xl" className="squircle-es-3xl bg-violet-600" />
            <Box label="squircle-ee-3xl" className="squircle-ee-3xl bg-violet-600" />
            <Box label="squircle-ss-3xl" className="squircle-ss-3xl bg-violet-600" />
          </div>
        </section>
      </div>
    </div>
  );
}
