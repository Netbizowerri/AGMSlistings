import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import VesselSearch from "./pages/VesselSearch";
import VesselDetail from "./pages/VesselDetail";
import Contact from "./pages/Contact";
import { About, Privacy, Legal } from "./pages/Static";

// Lazy-loaded so the Firebase SDK (Auth + Firestore) is only downloaded by
// someone who actually visits /adminlogin, keeping it off the public bundle.
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin is intentionally OUTSIDE Layout: no public header, nav,
            footer or chat widget on the dashboard. */}
        <Route
          path="/adminlogin"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-dvh items-center justify-center bg-[#050F24] px-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3465] border-t-[#FFCC00]" />
                    <p className="text-sm text-[#93A5C4]">Loading admin…</p>
                  </div>
                </div>
              }
            >
              <AdminLogin />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/vessels" element={<VesselSearch />} />
          <Route path="/vessels/:id" element={<VesselDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
