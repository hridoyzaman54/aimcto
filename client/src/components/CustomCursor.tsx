import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Use RAF for smooth, lag-free cursor tracking
    let rafId: number;
    let mouseX = -100;
    let mouseY = -100;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updateCursor = () => {
      cursor.style.transform = `translate(${mouseX - 16}px, ${mouseY - 16}px)`;
      rafId = requestAnimationFrame(updateCursor);
    };

    // Use pointerover instead of mouseover - less frequent, more efficient
    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const shouldHover =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.classList.contains("hover-trigger");

      if (shouldHover !== isHovered.current) {
        isHovered.current = shouldHover;
        cursor.style.scale = shouldHover ? "1.5" : "1";
        dot.style.opacity = shouldHover ? "0" : "1";
      }
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    rafId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("pointerover", handlePointerOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:block fixed top-0 left-0 w-8 h-8 border border-primary rounded-full pointer-events-none z-[9999] will-change-transform"
      style={{
        transition: "scale 0.15s ease",
      }}
    >
      <div
        ref={dotRef}
        className="w-1 h-1 bg-primary rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ transition: "opacity 0.15s ease" }}
      />
    </div>
  );
}
