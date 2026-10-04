import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export default function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    // Returning from the browser's page cache must also start at the top.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetScroll();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useLayoutEffect(() => {
    // The full location also covers history changes and same-page navigation.
    resetScroll();
  }, [location]);

  return null;
}