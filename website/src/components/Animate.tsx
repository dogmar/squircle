import { createContext, useContext } from "react";
import { AnimatePresence, motion, type MotionProps } from "framer-motion";

interface SlideContext {
  step: number;
  onAmountChange?: (amount: number) => void;
}

const SlideStepContext = createContext<SlideContext>({ step: 0 });

export function SlideStepProvider({
  step,
  onAmountChange,
  children,
}: {
  step: number;
  onAmountChange?: (amount: number) => void;
  children: React.ReactNode;
}) {
  return (
    <SlideStepContext.Provider value={{ step, onAmountChange }}>
      {children}
    </SlideStepContext.Provider>
  );
}

export function useSlideStep() {
  return useContext(SlideStepContext).step;
}

export function useAmountControl() {
  return useContext(SlideStepContext).onAmountChange;
}

export function Animate({
  inStep,
  outStep,
  children,
  initial,
  animate,
  exit,
}: {
  inStep: number;
  outStep?: number;
  children: React.ReactNode;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  exit?: MotionProps["exit"];
}) {
  const currentStep = useSlideStep();
  const visible = currentStep >= inStep && (outStep == null || currentStep < outStep);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`animate-${inStep}`}
          initial={initial ?? { opacity: 0, y: 8 }}
          animate={animate ?? { opacity: 1, y: 0 }}
          exit={exit ?? { opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
