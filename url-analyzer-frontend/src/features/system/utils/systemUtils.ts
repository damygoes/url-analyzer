export function formatStatLabel(statKey: string) {
  // Convert snake_case to words
  return statKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
