import { useEffect, useRef, useCallback } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
  format?: (value: number) => string;
}

export default function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 2,
  className = "",
  separator = "",
  format,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  const formatValue = useCallback(
    (latest: number) => {
      if (format) return format(latest);
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      };
      const formatted = Intl.NumberFormat("en-US", options).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [format, separator]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(from);
    }
  }, [from, to, formatValue]);

  useEffect(() => {
    if (isInView) {
      const timeoutId = setTimeout(() => motionValue.set(to), delay * 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isInView, motionValue, from, to, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
