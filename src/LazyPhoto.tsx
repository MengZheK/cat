import React from "react";
import { isVideoSrc, resolvePhotoSrc, type PhotoImageVariant } from "./imageUrl";
import ProgressiveImage, { type ProgressiveRevealProfile } from "./ProgressiveImage";
import { useInView } from "./useInView";

type LazyPhotoProps = {
  src: string;
  alt?: string;
  className?: string;
  variant?: PhotoImageVariant;
  /** 为 true 时跳过懒加载，立即请求（仅首屏极少数图） */
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  fit?: "intrinsic" | "cover";
  reveal?: ProgressiveRevealProfile;
  revealDelayMs?: number;
  /** 进入视口前的预加载距离；相册建议 0，地图列表可更大 */
  rootMargin?: string;
  /** 是否加载极小模糊占位图（相册列表可关以省流量） */
  placeholder?: boolean;
};

export default function LazyPhoto({
  src,
  alt = "",
  className,
  variant = "grid",
  priority = false,
  fetchPriority,
  fit = "intrinsic",
  reveal = "default",
  revealDelayMs = 0,
  rootMargin,
  placeholder = true,
}: LazyPhotoProps) {
  const relaxed = reveal === "relaxed";
  const margin =
    rootMargin ?? (relaxed ? "80px 0px" : "400px 0px");

  const { ref, inView } = useInView<HTMLDivElement>({
    enabled: !priority,
    rootMargin: margin,
  });

  const loadEnabled = priority || inView;
  const video = isVideoSrc(src);

  return (
    <div ref={ref} className={"lazyPhotoWrap" + (video ? " lazyPhotoWrap--video" : "")}>
      {video ? (
        loadEnabled ? (
          <>
            <video
              className={"lazyVideo " + (className ?? "")}
              src={resolvePhotoSrc(src) + "#t=0.1"}
              muted
              playsInline
              preload="metadata"
              aria-label={alt || "视频"}
            />
            <span className="lazyVideoBadge" aria-hidden>
              ▶
            </span>
          </>
        ) : (
          <div className="lazyVideoPlaceholder" aria-hidden />
        )
      ) : (
        <ProgressiveImage
          src={src}
          alt={alt}
          className={className ?? ""}
          variant={variant}
          loadEnabled={loadEnabled}
          placeholderEnabled={placeholder}
          fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
          fit={fit}
          reveal={reveal}
          revealDelayMs={revealDelayMs}
        />
      )}
    </div>
  );
}
