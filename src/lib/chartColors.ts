/** Chart segments — green & yellow family (high contrast). */
export const CHART_SEGMENT_COLORS = [
  "#136f2b",
  "#ffd300",
  "#c9e265",
  "#0e5a22",
  "#e6b800",
  "#5a9c3d",
  "#f5e6a8",
  "#2d8a47",
  "#b8860b",
  "#8fbc55",
  "#1f5c2e",
  "#fff3b0",
  "#4a7c3a",
  "#d4a017",
];

export function chartColorForIndex(index: number): string {
  return CHART_SEGMENT_COLORS[index % CHART_SEGMENT_COLORS.length];
}
