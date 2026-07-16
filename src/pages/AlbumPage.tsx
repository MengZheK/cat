import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import usePhotos from "../usePhotos";
import type { Photo } from "../photoUtils";
import PhotoDetailModal from "../PhotoDetailModal";
import BrandMark from "../BrandMark";
import PhotoWaterfall from "../PhotoWaterfall";
import PageLoader from "../PageLoader";
import { useAlbumMobile } from "../useAlbumMobile";

const ALBUM_NAV_TABS = [
  { id: "latest", label: "最新" },
  { id: "cow", label: "奶牛" },
  { id: "meat", label: "鲜肉" },
] as const;

type AlbumNavId = (typeof ALBUM_NAV_TABS)[number]["id"];

const SCROLL_COMPACT_PX = 56;
const MOBILE_HEADER_HIDE_BRAND_PX = 36;

function sortByLatest(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
}

function filterPhotosForNav(photos: Photo[], nav: AlbumNavId): Photo[] {
  switch (nav) {
    case "latest":
      return sortByLatest(photos);
    case "cow":
      return sortByLatest(photos.filter((p) => p.categoryId === "cow"));
    case "meat":
      return sortByLatest(photos.filter((p) => p.categoryId === "meat"));
    default:
      return sortByLatest(photos);
  }
}

function useAlbumLayout() {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useAlbumMobile();
  const [mobileScrollCompact, setMobileScrollCompact] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setScrolled(false);
      return;
    }
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_COMPACT_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setMobileScrollCompact(false);
      return;
    }
    const onScroll = () => {
      setMobileScrollCompact(window.scrollY > MOBILE_HEADER_HIDE_BRAND_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  return { scrolled, isMobile, mobileScrollCompact };
}

function AlbumBrand({ mobile }: { mobile?: boolean }) {
  return (
    <Link to="/album" className={"albumBrand " + (mobile ? "albumBrand--mobile" : "")}>
      <BrandMark size={28} className="albumBrandMark" />
      <span className="albumBrandWordmark brandWordmark">Hayato Photography</span>
    </Link>
  );
}

function AlbumContactLink({ className }: { className?: string }) {
  return (
    <Link to="/contact" className={"albumContactLink " + (className ?? "")}>
      联系作者
    </Link>
  );
}

export default function AlbumPage() {
  const { photos, loading, error } = usePhotos();
  const [activeNav, setActiveNav] = useState<AlbumNavId>("latest");
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { scrolled, isMobile, mobileScrollCompact } = useAlbumLayout();

  const displayedPhotos = useMemo(() => filterPhotosForNav(photos, activeNav), [photos, activeNav]);

  const navTabs = (
    <nav className="albumNavTabs" aria-label="相册分类">
      {ALBUM_NAV_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={"albumNavTab " + (activeNav === t.id ? "albumNavTab--active" : "")}
          onClick={() => setActiveNav(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="page" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ padding: 20, background: "#fff", borderRadius: 12 }}>{error}</div>
      </div>
    );
  }

  const pageMods =
    "albumPage " +
    (isMobile ? "albumPage--mobile " : "") +
    (isMobile && mobileScrollCompact ? "albumPage--mobileCompact " : "") +
    (!isMobile && scrolled ? "albumPage--scrolled " : "");

  return (
    <div className={"page " + pageMods.trim()}>
      <header className={"albumTopBar " + (isMobile ? "albumTopBar--mobile" : "")}>
        {!isMobile ? (
          <>
            {!scrolled ? (
              <div className="albumHeaderTier albumHeaderTier--brand">
                <div className="albumLayoutInner albumHeaderTierInner albumHeaderTierInner--brand">
                  <AlbumBrand />
                  <div className="albumHeaderBrandRight">
                    <AlbumContactLink />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="albumHeaderTier albumHeaderTier--nav">
              <div className="albumLayoutInner albumHeaderTierInner albumHeaderTierInner--nav">
                {navTabs}
                {scrolled ? (
                  <div className="albumHeaderNavRight">
                    <AlbumContactLink />
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="albumHeaderTier albumHeaderTier--mobile">
            <div className="albumLayoutInner albumMobileHeaderInner">
              {!mobileScrollCompact ? (
                <div className="albumMobileBrandBlock">
                  <AlbumBrand mobile />
                </div>
              ) : null}
              <div
                className={
                  "albumMobileTabsWrap" +
                  (mobileScrollCompact ? " albumMobileTabsWrap--tabsOnly" : "")
                }
              >
                {navTabs}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="albumContentWrap">
        <div className="albumLayoutInner albumMainInner">
          <PhotoWaterfall
            photos={displayedPhotos}
            activePhotoId={activePhotoId}
            onClickPhoto={(photoId) => {
              setActivePhotoId(photoId);
              setDetailOpen(true);
            }}
          />
        </div>
      </div>

      {isMobile ? (
        <div className="albumMobileDock" role="navigation" aria-label="联系">
          <AlbumContactLink className="albumMobileDockContact" />
        </div>
      ) : null}

      {activePhotoId && detailOpen ? (
        <PhotoDetailModal
          photos={displayedPhotos}
          activePhotoId={activePhotoId}
          onActivePhotoIdChange={setActivePhotoId}
          onClose={() => {
            setDetailOpen(false);
            setActivePhotoId(null);
          }}
        />
      ) : null}
    </div>
  );
}
