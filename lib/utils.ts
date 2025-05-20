import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// used for aceternity UI components

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
