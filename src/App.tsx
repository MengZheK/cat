import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PhotosProvider } from "./PhotosProvider";
import PageLoader from "./PageLoader";
import { VisitCounterProvider } from "./VisitCounter";
import AlbumPage from "./pages/AlbumPage";

const ContactPage = lazy(() => import("./pages/ContactPage"));

export default function App() {
  return (
    <PhotosProvider>
      <VisitCounterProvider>
        <Suspense fallback={<PageLoader message="加载中…" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/album" replace />} />
            <Route path="/album" element={<AlbumPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Suspense>
      </VisitCounterProvider>
    </PhotosProvider>
  );
}
