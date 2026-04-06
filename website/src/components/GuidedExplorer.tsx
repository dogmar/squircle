import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from "framer-motion";
import { SlideStepProvider } from "./Animate";
import ExplorerGraphic, { type GraphicState } from "./ExplorerGraphic";
import SlideControls from "./SlideControls";
import FreeExplorer from "./FreeExplorer";
import { slides } from "./slides";

const INITIAL_GRAPHIC_STATE: GraphicState = {
  showRounded: false,
  showSuperellipse: false,
  correctionAmount: 0,
  amount: 1.5,
  showRefLine: false,
  showMeasurement: false,
  measureArc: undefined,
  showFill: true,
  showStroke: false,
  zoom: 1,
};

function computeGraphicState(slideIndex: number, stepIndex: number): GraphicState {
  let state = { ...INITIAL_GRAPHIC_STATE };
  for (let si = 0; si <= slideIndex; si++) {
    const slide = slides[si]!;
    const maxStep = si === slideIndex ? stepIndex : slide.steps.length - 1;
    for (let sti = 0; sti <= maxStep; sti++) {
      const step = slide.steps[sti];
      if (step?.graphic) {
        state = { ...state, ...step.graphic };
      }
    }
  }
  return state;
}

export default function GuidedExplorer() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<"tour" | "explore">("tour");
  const [exploreState, setExploreState] = useState<GraphicState | null>(null);
  const [userAmount, setUserAmount] = useState<number | null>(null);

  // Compute the target graphic state from the current position
  const targetState = useMemo(
    () => computeGraphicState(slideIndex, stepIndex),
    [slideIndex, stepIndex],
  );

  // Animated amount using framer-motion spring
  const amountMV = useMotionValue(targetState.amount);
  const currentStep = slides[slideIndex]?.steps[stepIndex];
  const transitionDuration = currentStep?.transition?.duration ?? 0.4;
  const springConfig: SpringOptions = {
    stiffness: Math.max(20, 200 / transitionDuration),
    damping: 30,
    mass: 1,
  };
  const amountSpring = useSpring(amountMV, springConfig);
  const [animatedAmount, setAnimatedAmount] = useState(targetState.amount);

  useEffect(() => {
    if (userAmount != null) {
      // Slider: bypass spring, update instantly
      amountMV.jump(userAmount);
    } else {
      // Step transition: animate via spring
      amountMV.set(targetState.amount);
    }
  }, [targetState.amount, userAmount, amountMV]);

  useEffect(() => {
    const unsubscribe = amountSpring.on("change", (v) => {
      setAnimatedAmount(v);
    });
    return unsubscribe;
  }, [amountSpring]);

  // Animated correctionAmount using framer-motion spring
  const correctionMV = useMotionValue(targetState.correctionAmount);
  const correctionSpring = useSpring(correctionMV, { stiffness: 80, damping: 20, mass: 1 });
  const [animatedCorrection, setAnimatedCorrection] = useState(targetState.correctionAmount);

  useEffect(() => {
    correctionMV.set(targetState.correctionAmount);
  }, [targetState.correctionAmount, correctionMV]);

  useEffect(() => {
    const unsubscribe = correctionSpring.on("change", (v) => {
      setAnimatedCorrection(v);
    });
    return unsubscribe;
  }, [correctionSpring]);

  const currentSlide = slides[slideIndex]!;
  const isLastSlide = slideIndex === slides.length - 1;
  const isLastStep = stepIndex === currentSlide.steps.length - 1;
  const isLastStepOfLastSlide = isLastSlide && isLastStep;

  const handleNext = useCallback(() => {
    setUserAmount(null);
    if (!isLastStep) {
      setStepIndex((s) => s + 1);
    } else if (isLastStepOfLastSlide) {
      const finalState = computeGraphicState(slideIndex, stepIndex);
      setExploreState(finalState);
      setMode("explore");
    } else {
      setSlideIndex((s) => s + 1);
      setStepIndex(0);
    }
  }, [isLastStep, isLastStepOfLastSlide, slideIndex, stepIndex]);

  const handleBack = useCallback(() => {
    setUserAmount(null);
    if (mode === "explore") {
      setMode("tour");
    } else if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    } else if (slideIndex > 0) {
      const prevSlide = slides[slideIndex - 1]!;
      setSlideIndex((s) => s - 1);
      setStepIndex(prevSlide.steps.length - 1);
    }
  }, [mode, stepIndex, slideIndex]);

  // Compute total steps across all slides for the progress indicator
  const totalStepsAcrossSlides = useMemo(
    () => slides.reduce((acc, s) => acc + s.steps.length, 0),
    [],
  );
  const currentAbsoluteStep = useMemo(() => {
    let count = 0;
    for (let si = 0; si < slideIndex; si++) {
      count += slides[si]!.steps.length;
    }
    count += stepIndex;
    return count;
  }, [slideIndex, stepIndex]);

  // Graphic state to pass to ExplorerGraphic
  const graphicStateForDisplay: GraphicState =
    mode === "explore" && exploreState
      ? exploreState
      : { ...targetState, amount: animatedAmount, correctionAmount: animatedCorrection };

  const canGoBack = mode === "explore" || slideIndex > 0 || stepIndex > 0;
  const canGoNext = mode !== "explore";

  const stepDef = currentSlide.steps[stepIndex];
  const nextLabel = isLastStepOfLastSlide ? "Explore" : (stepDef?.nextLabel ?? "Next");

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-start">
      {/* Left: graphic */}
      <ExplorerGraphic {...graphicStateForDisplay} />

      {/* Right: content panel */}
      <div className="flex min-h-[300px] flex-col">
        {mode === "tour" ? (
          <>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <SlideStepProvider step={stepIndex} onAmountChange={setUserAmount}>
                    {currentSlide.content}
                  </SlideStepProvider>
                </motion.div>
              </AnimatePresence>
            </div>

            <SlideControls
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={canGoBack}
              canGoNext={canGoNext}
              currentStep={currentAbsoluteStep}
              totalSteps={totalStepsAcrossSlides}
              nextLabel={nextLabel}
            />
          </>
        ) : (
          <>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-zinc-100">Explore</h2>
              {exploreState && (
                <FreeExplorer
                  graphicState={exploreState}
                  onGraphicStateChange={(partial) =>
                    setExploreState((prev) => (prev ? { ...prev, ...partial } : prev))
                  }
                />
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleBack}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                &larr; Back to tour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
