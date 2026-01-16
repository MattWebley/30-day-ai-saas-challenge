import { useState, useCallback, useRef, RefObject } from "react";

/**
 * A useState wrapper for multi-step flows that automatically scrolls the
 * component container into view when the step changes. Provides a better UX
 * by ensuring users see the beginning of new step content.
 *
 * Returns [step, setStep, containerRef] - attach containerRef to your component's
 * outer div to enable scroll-to-component behavior.
 */
export function useStepWithScroll<T>(initialStep: T): [T, (step: T) => void, RefObject<HTMLDivElement | null>] {
  const [step, setStepInternal] = useState<T>(initialStep);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setStep = useCallback((newStep: T) => {
    setStepInternal(newStep);
    // Small delay to let React render the new content first
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: "instant", block: "start" });
      }
    }, 0);
  }, []);

  return [step, setStep, containerRef];
}
