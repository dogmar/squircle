import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  useMotionValue,
  usePresence,
  useSpring,
  type SpringOptions,
} from "framer-motion";
import { SlideStepProvider } from "./Animate";
import ExplorerGraphic, { type ArcStyle, type GraphicState } from "./ExplorerGraphic";
import FreeExplorer from "./FreeExplorer";
import { slides } from "./slides";

const SLIDE_EXIT_DURATION = 600; // ms — how long old slide stays alive for child exits

const SlideWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function SlideWrapper({ children }, ref) {
    const [isPresent, safeToRemove] = usePresence();

    useEffect(() => {
      if (!isPresent) {
        const timeout = setTimeout(safeToRemove, SLIDE_EXIT_DURATION);
        return () => clearTimeout(timeout);
      }
    }, [isPresent, safeToRemove]);

    return <div ref={ref}>{children}</div>;
  },
);

const HIDDEN_ARC: ArcStyle = { visible: false, showFill: false, showOutline: false };

const INITIAL_GRAPHIC_STATE: GraphicState = {
  arcRounded: { ...HIDDEN_ARC },
  arcSuperellipse: { ...HIDDEN_ARC },
  correctionAmount: 0,
  amount: 1.5,
  showRefLine: false,
  showMeasurement: false,
  measureArc: undefined,
  zoom: 1,
};

function mergeGraphicState(state: GraphicState, partial: Partial<GraphicState>): GraphicState {
  const merged = { ...state, ...partial };
  // Deep merge arc style objects
  if (partial.arcRounded) {
    merged.arcRounded = { ...state.arcRounded, ...partial.arcRounded };
  }
  if (partial.arcSuperellipse) {
    merged.arcSuperellipse = { ...state.arcSuperellipse, ...partial.arcSuperellipse };
  }
  return merged;
}

function computeGraphicState(slideIndex: number, stepIndex: number): GraphicState {
  let state: GraphicState = {
    ...INITIAL_GRAPHIC_STATE,
    arcRounded: { ...INITIAL_GRAPHIC_STATE.arcRounded },
    arcSuperellipse: { ...INITIAL_GRAPHIC_STATE.arcSuperellipse },
  };
  for (let si = 0; si <= slideIndex; si++) {
    const slide = slides[si]!;
    const maxStep = si === slideIndex ? stepIndex : slide.steps.length - 1;
    for (let sti = 0; sti <= maxStep; sti++) {
      const step = slide.steps[sti];
      if (step?.graphic) {
        state = mergeGraphicState(state, step.graphic);
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

  // Graphic state to pass to ExplorerGraphic
  const graphicStateForDisplay: GraphicState =
    mode === "explore" && exploreState
      ? exploreState
      : { ...targetState, amount: animatedAmount, correctionAmount: animatedCorrection };

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-start">
      {/* Left: graphic */}
      <div className="md:-mt-[10%]">
        <ExplorerGraphic {...graphicStateForDisplay} />
      </div>
      {/* Right: content panel */}
      <div className="flex h-full min-h-[500px] flex-col md:h-full md:min-h-0">
        {mode === "tour" ? (
          <>
            <div className="flex-1 grow">
              <AnimatePresence initial={false}>
                <SlideWrapper key={slideIndex}>
                  <SlideStepProvider
                    step={stepIndex}
                    onAmountChange={setUserAmount}
                    onNext={handleNext}
                    onBack={handleBack}
                  >
                    {currentSlide.content}
                  </SlideStepProvider>
                </SlideWrapper>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-zinc-100">Explore</h2>
              {exploreState && (
                <FreeExplorer
                  graphicState={exploreState}
                  onGraphicStateChange={(partial) =>
                    setExploreState((prev) => (prev ? mergeGraphicState(prev, partial) : prev))
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
