export function getTotalLinks(internal: number, external: number): number {
  return (internal ?? 0) + (external ?? 0);
}
