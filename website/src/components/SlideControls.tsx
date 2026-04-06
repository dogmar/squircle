export default function SlideControls({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  currentStep,
  totalSteps,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Back
      </button>

      {/* Step dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i <= currentStep ? "bg-zinc-300" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {nextLabel ?? "Next"}
      </button>
    </div>
  );
}
