import { publicUrl } from "./publicUrl";

/** 相册图床域名，用于 preconnect */
export const COS_IMAGE_ORIGIN = "https://robotkang-1257995526.cos.ap-chengdu.myqcloud.com";

export type PhotoImageVariant = "full" | "grid" | "thumb";

const COS_IMAGE_HOST = /\.(cos|pic)\.[\w-]+\.myqcloud\.com/i;

function isCosImageUrl(url: string): boolean {
  return COS_IMAGE_HOST.test(url);
}

function appendCosProcess(url: string, process: string): string {
  if (/imageMogr2|imageView2/i.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${process}`;
}

/** 按 EXIF 纠正方向后再做后续处理（避免缩略图侧倒） */
function cosPipeline(...steps: string[]): string {
  const ops = ["imageMogr2/auto-orient", ...steps];
  return ops.join("|");
}

/** 解析 photos.json 中的 src（相对路径或完整 URL） */
export function resolvePhotoSrc(src: string): string {
  if (!src?.trim()) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return publicUrl(src);
}

/** 是否为视频资源（如 cow73.mp4） */
export function isVideoSrc(src: string): boolean {
  const path = resolvePhotoSrc(src).split("?")[0] ?? "";
  return /\.(mp4|webm|mov|m4v)$/i.test(path);
}

/**
 * 列表/缩略图使用 COS 数据万象压缩；大图预览用原图。
 * 视频不做图片处理，直接返回原地址。
 * 若桶未开通图片处理，LazyPhoto 会在 onError 时回退到原图。
 */
export function photoDisplayUrl(src: string, variant: PhotoImageVariant = "full"): string {
  const url = resolvePhotoSrc(src);
  if (!url || isVideoSrc(src) || !isCosImageUrl(url)) return url;

  if (variant === "full") {
    return appendCosProcess(url, "imageMogr2/auto-orient");
  }

  const width = variant === "thumb" ? 280 : 800;
  const process = cosPipeline(`imageMogr2/thumbnail/${width}x/format/webp/quality/85`);
  return appendCosProcess(url, process);
}

/** 极小模糊图，用于渐进式占位（blur-up） */
export function photoPlaceholderUrl(src: string): string | null {
  if (isVideoSrc(src)) return null;
  const url = resolvePhotoSrc(src);
  if (!isCosImageUrl(url)) return null;
  const process = cosPipeline("imageMogr2/thumbnail/48x/format/webp/quality/50/blur/8");
  return appendCosProcess(url, process);
}

/** 预加载单张图片（用于大图切换） */
export function preloadPhoto(src: string, variant: PhotoImageVariant = "full"): void {
  if (isVideoSrc(src)) return;
  const url = photoDisplayUrl(src, variant);
  if (!url) return;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}
