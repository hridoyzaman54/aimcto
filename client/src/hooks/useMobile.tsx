import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with actual value if window is available (client-side)
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  React.useEffect(() => {
    // Set initial value immediately
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    
    // Also listen to resize for more reliable detection
    window.addEventListener("resize", onChange);
    
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return isMobile;
}
