import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export function PlaceholderCyclingInput({
  placeholders,
  value,
  onChange,
}: {
  placeholders: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  // which placeholder we’re on
  const [idx, setIdx] = useState(0);

  // in the browser, setInterval returns a number
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // cycle every 2s
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % placeholders.length);
    }, 3000);

    return () => {
      // clear when unmounting or placeholders change
      if (timer.current !== undefined) {
        window.clearInterval(timer.current);
      }
    };
  }, [placeholders.length]);

  return (
    <div className="relative">
      {/* real input uses native placeholder */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholders[idx]}
        className={cn(
          "w-full rounded-full border border-gray-300 px-4 py-2 focus:outline-none",
          !value && "text-gray-500"
        )}
      />

      {/* optional fading overlay for the placeholder text */}
      <AnimatePresence>
        {!value && (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500"
          >
            {placeholders[idx]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
