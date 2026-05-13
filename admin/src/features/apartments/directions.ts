const directionLabels: Record<string, string> = {
  N: "Bắc",
  S: "Nam",
  E: "Đông",
  W: "Tây",
  NE: "Đông Bắc",
  NW: "Tây Bắc",
  SE: "Đông Nam",
  SW: "Tây Nam",
};

export function formatDirection(value: string): string {
  return directionLabels[value] ?? value;
}
