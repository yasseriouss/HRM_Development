/**
 * Platform contract file — do not restructure.
 *
 * This file is part of the contract between the slides artifact and
 * the surrounding workspace tooling (preview, thumbnails, exports).
 * Reorganizing it, swapping the router, or changing the structure
 * of `AllSlides` can quietly break that tooling even when the page
 * still looks correct in the preview.
 *
 * Agents: see the slides skill `<workspace_contract>` for the full
 * rules, and `references/visual_qa.md` → "Platform contract sanity
 * check" if this file has been hand-edited and needs repair.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useT } from "@/i18n";
import { useLang } from "@shared/contexts/LangContext";
import { slides } from "./slideLoader";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrandLogoUrl } from "@/shared/lib/brand";


function getSlideIndex(pathname: string): number {
  const match = pathname.match(/^\/slide(\d+)$/);
  if (!match) return -1;
  const position = parseInt(match[1], 10);
  return slides.findIndex((s) => s.position === position);
}

function SlideEditor() {
  const [location, navigate] = useLocation();
  const currentIndex = getSlideIndex(location);

  // In the workspace, the slide iframe is nested inside another iframe,
  // so window.parent !== window.parent.parent. In the deployed SlideViewer,
  // the parent is the top-level window, so they're equal. Disable local
  // navigation only in the workspace — the parent owns it there.
  const navigationDisabledRef = useRef(window.parent !== window.parent.parent);
  const touchHandledRefStable = useRef(false);

  useEffect(() => {
    if (currentIndex === -1) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (navigationDisabledRef.current) return;
      if (event.key === " ") {
        event.preventDefault();
      }
      if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && currentIndex > 0) {
        navigate(`/slide${slides[currentIndex - 1].position}`);
      }
      if (
        (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") &&
        currentIndex < slides.length - 1
      ) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    const INTERACTIVE =
      "a,button,video,audio,input,select,textarea,details,summary,iframe,svg,canvas," +
      '[role="button"],[contenteditable="true"]';

    const isInteractive = (target: EventTarget | null) =>
      (target as HTMLElement | null)?.closest?.(INTERACTIVE);

    const touchHandledRef = touchHandledRefStable;

    const onClick = (event: MouseEvent) => {
      if (touchHandledRef.current) {
        touchHandledRef.current = false;
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (isInteractive(event.target)) return;

      if (event.detail === 2) {
        window.parent.postMessage({ type: "slideViewerToggleFullscreen" }, "*");
        return;
      }

      if (navigationDisabledRef.current) {
        window.parent.postMessage({ type: "advanceSlide" }, "*");
        return;
      }

      if (currentIndex < slides.length - 1) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchTarget: EventTarget | null = null;

    const onTouchStart = (event: TouchEvent) => {
      touchHandledRef.current = false;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchTarget = event.target;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) >= 10 || Math.abs(dy) >= 10) return;
      if (isInteractive(touchTarget)) return;
      touchHandledRef.current = true;

      if (navigationDisabledRef.current) {
        window.parent.postMessage({ type: "advanceSlide" }, "*");
        return;
      }

      const fraction = touchStartX / window.innerWidth;
      if (fraction < 0.4 && currentIndex > 0) {
        navigate(`/slide${slides[currentIndex - 1].position}`);
      } else if (fraction >= 0.4 && currentIndex < slides.length - 1) {
        navigate(`/slide${slides[currentIndex + 1].position}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [currentIndex, navigate]);

  const activeSlide = currentIndex >= 0 ? slides[currentIndex] : null;

  return (
    <div className="select-none relative">
      {activeSlide && (
        // Keyed on slide id so navigating triggers a clean remount and
        // re-plays each slide's entrance animations.
        <div key={activeSlide.id} className="slide slide-stage">
          <activeSlide.Component />
        </div>
      )}
    </div>
  );
}

// Do not rewrite this component. Each slide must remain wrapped in
// `<div className="slide">` sized 1920×1080 — the class name and
// dimensions are part of the platform contract. See the file-level
// banner above for context.
function AllSlides() {
  return (
    <div className="bg-[var(--slide-bg)]">
      {slides.map((slide) => (
        <div
          key={slide.id}
          className="slide relative aspect-video overflow-hidden"
          style={{ width: "1920px", height: "1080px" }}
        >
          <div className="h-full w-full [&_.h-screen]:h-full! [&_.w-screen]:w-full!">
            <slide.Component />
          </div>
        </div>
      ))}
    </div>
  );
}

// This component is used for the deployed view at `/`
function SlideViewer() {
  const [location] = useLocation();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dims, setDims] = useState(() => ({
    width: Math.min(window.innerWidth, window.innerHeight * (16 / 9)),
    height: Math.min(window.innerHeight, window.innerWidth * (9 / 16)),
  }));

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err: Error) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      void document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "slideViewerToggleFullscreen") {
        toggleFullscreen();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [toggleFullscreen]);

  useEffect(() => {
    const update = () => {
      const target = containerRef.current || window;
      const w = "innerWidth" in target ? (target as Window).innerWidth : (target as HTMLElement).clientWidth;
      const h = "innerHeight" in target ? (target as Window).innerHeight : (target as HTMLElement).clientHeight;
      
      const padding = isFullscreen ? 0 : Math.max(40, Math.min(w * 0.1, h * 0.1));
      const availableW = w - padding;
      const availableH = h - padding;

      setDims({
        width: Math.min(availableW, availableH * (16 / 9)),
        height: Math.min(availableH, availableW * (9 / 16)),
      });
    };
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, [isFullscreen]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && document.fullscreenElement === containerRef.current) {
        event.preventDefault();
        void document.exitFullscreen();
        return;
      }
      if (event.key === "f" || event.key === "F") toggleFullscreen();
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== " ") return;
      if (event.key === " ") event.preventDefault();
      iframeRef.current?.contentWindow?.dispatchEvent(
        new KeyboardEvent("keydown", { key: event.key, code: event.code, bubbles: true }),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen]);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const firstPosition = slides.length > 0 ? slides[0].position : 1;

  return (
    <div
      ref={containerRef}
      className="slide-viewer w-full h-full min-h-[500px] overflow-hidden bg-background flex items-center justify-center relative group"
      onClick={(e) => {
        if (e.target === e.currentTarget && !document.fullscreenElement) {
          void containerRef.current?.requestFullscreen().catch((err: Error) => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
        }
        iframeRef.current?.focus();
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .slide-viewer {
          background-image: radial-gradient(circle at 20% 20%, oklch(64% 0.13 28 / 0.03) 0%, transparent 40%),
                            radial-gradient(circle at 80% 80%, oklch(64% 0.13 28 / 0.03) 0%, transparent 40%);
        }
        
        .slide-frame-container {
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fs-toggle-btn {
          backdrop-filter: blur(16px);
          background: oklch(var(--color-surface) / 0.8);
          border: 1px solid oklch(var(--color-primary) / 0.1);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
        }

        .fs-toggle-btn:hover {
          background: oklch(var(--color-primary) / 0.05);
          border-color: oklch(var(--color-primary) / 0.2);
        }
      `}} />
      
      <div
        className="slide-frame-container relative z-10 shrink-0 p-3"
        style={{ width: dims.width + 24, height: dims.height + 24 }}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          if (!document.fullscreenElement) {
            void containerRef.current?.requestFullscreen().catch((err: Error) => {
              console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
          }
        }}
      >
        <iframe
          key={lang}
          ref={iframeRef}
          src={`${base}/slide${firstPosition}`}
          className={`pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-none overflow-hidden ${isFullscreen ? "rounded-none shadow-none" : "rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)]"}`}
          style={{ width: dims.width, height: dims.height }}
          onLoad={() => iframeRef.current?.focus()}
          title="Presentation slides — double-click the slide to toggle fullscreen; Esc exits fullscreen"
        />
      </div>

      {/* Floating Controls Overlay - Moved outside frame to prevent overlap */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <div className="flex fs-toggle-btn p-2 rounded-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              iframeRef.current?.contentWindow?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
            }}
            className="rounded-xl h-10 w-10 hover:bg-primary/10 text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="px-2 flex items-center justify-center font-headline font-bold text-xs text-primary/60 min-w-12">
            {slides.findIndex(s => String(location).includes(s.position.toString())) + 1} / {slides.length}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              iframeRef.current?.contentWindow?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
            }}
            className="rounded-xl h-10 w-10 hover:bg-primary/10 text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="w-px h-5 bg-primary/10 self-center mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="rounded-xl h-10 w-10 hover:bg-primary/10 text-primary transition-colors"
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen (click deck or double-click slide, Esc to exit)"}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Subtle Branding */}
      <div className={`absolute top-10 ${isAr ? 'right-10' : 'left-10'} z-50 opacity-20 pointer-events-none transition-opacity duration-1000`}>
        <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <img src={getBrandLogoUrl()} alt="" className="h-8 w-auto max-w-[120px] object-contain opacity-80" width={120} height={32} />
          <div className="font-headline font-black text-xs tracking-[0.3em] text-primary uppercase">
            EDITORIAL PRESENTATION
          </div>
          <div className="h-px w-12 bg-primary/20" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [location, navigate] = useLocation();

  // DO NOT edit this useEffect - redirects unknown routes to the first slide.
  // The "/" and "/allslides" routes are handled separately below.
  useEffect(() => {
    if (
      location !== "/" &&
      location !== "/allslides" &&
      getSlideIndex(location) === -1
    ) {
      if (slides.length > 0) {
        navigate(`/slide${slides[0].position}`, { replace: true });
      }
    }
  }, [location, navigate]);

  // DO NOT edit this useEffect - allows the parent frame to navigate
  // between slides via postMessage so it can avoid changing the iframe
  // src (which causes a white flash).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "navigateToSlide" &&
        typeof event.data.position === "number" &&
        slides.some((s) => s.position === event.data.position)
      ) {
        navigate(`/slide${event.data.position}`);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  if (location === "/") return <SlideViewer />;
  if (location === "/allslides") return <AllSlides />;
  return <SlideEditor />;
}
