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
                <div className="min-h-screen bg-neutral-100 px-4 py-8">
                  <p className="mx-auto max-w-6xl text-sm text-neutral-600">
                    Loading admin…
                  </p>
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
