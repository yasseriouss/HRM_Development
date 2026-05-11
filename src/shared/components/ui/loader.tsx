import React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export function Loader({ className, text = "INITIALIZING...", ...props }: LoaderProps) {
  return (
    <div className={cn("hacker-loader", className)} {...props}>
      <div className="loader-text">
        <span data-text={text} className="text-glitch uppercase tracking-widest font-mono text-xs sm:text-sm">
          {text}
        </span>
      </div>
      <div className="loader-bar">
        <div className="bar-fill"></div>
        <div className="bar-glitch"></div>
      </div>
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
}
