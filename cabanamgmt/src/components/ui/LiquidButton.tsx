"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = Omit<HTMLMotionProps<"button">, "whileHover" | "whileTap">;

export default function LiquidButton({ className, children, ...rest }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={cn("liquid-btn rounded-xl px-5 py-2 text-sm font-medium text-white", className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
