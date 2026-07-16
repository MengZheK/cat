/**
 * 与 public/photos/categories.json 及站内兜底一致：按 categoryId 解析中文栏目名。
 */
export type CategoryDefinition = { id: string; label: string };

/** categories.json 缺失某 id 时的内置中文名 */
export const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  cow: "奶牛",
  meat: "鲜肉",
};

/**
 * @param defsFromFile useCategories 拉取的 categories.json
 */
export function categoryTitleForId(
  categoryId: string | null | undefined,
  defsFromFile: CategoryDefinition[],
): string {
  if (categoryId == null || String(categoryId).trim() === "") return "-";
  const id = String(categoryId);
  const fromFile = defsFromFile.find((c) => c.id === id);
  if (fromFile) return fromFile.label;
  return DEFAULT_CATEGORY_LABELS[id] ?? id;
}
