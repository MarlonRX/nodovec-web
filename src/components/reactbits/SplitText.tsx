import { motion } from "motion/react";

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  duration?: number;
}

export default function SplitText({
  text = "",
  className = "",
  charClassName = "",
  delay = 40,
  duration = 0.5,
}: SplitTextProps) {
  let charIndex = 0;
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-pre">
          {word.split("").map((char, i) => {
            const current = charIndex++;
            return (
              <motion.span
                key={i}
                className={`inline-block will-change-transform ${charClassName}`}
                aria-hidden="true"
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: (current * delay) / 1000,
                  duration,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {wordIdx < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
