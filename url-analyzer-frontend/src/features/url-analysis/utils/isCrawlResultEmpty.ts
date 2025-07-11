import type { CrawlResult } from '@/shared/types/api';

export function isCrawlResultEmpty(result: CrawlResult): boolean {
  const {
    internal_links = 0,
    external_links = 0,
    h1_count = 0,
    h2_count = 0,
    h3_count = 0,
    h4_count = 0,
    h5_count = 0,
    h6_count = 0,
  } = result;

  const totalLinks = internal_links + external_links;
  const totalHeadings =
    h1_count + h2_count + h3_count + h4_count + h5_count + h6_count;

  return totalLinks === 0 && totalHeadings === 0;
}
